#!/usr/bin/env python3
"""
Script to safely initialize database for production
- Fixes model definitions if needed
- Creates tables only if they don't exist
- No data loss, safe for production use
"""
import os
import sys
import importlib
import inspect
import re
import logging
from pathlib import Path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import engine
from app.models.base import Base
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy import inspect as sa_inspect

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('db_init')

def fix_tablename_in_model_file(file_path):
    """Fix tablename to __tablename__ in model files - safe for production"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if it needs to be fixed
        if re.search(r'^\s*tablename\s*=', content, re.MULTILINE):
            # Replace tablename = with __tablename__ =
            fixed_content = re.sub(r'(\s*)tablename(\s*=)', r'\1__tablename__\2', content)
            
            with open(file_path, 'w') as f:
                f.write(fixed_content)
            
            logger.info(f"Fixed tablename in {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error fixing {file_path}: {e}")
        return False

def find_and_fix_model_files():
    """Find and fix all model files with tablename issues"""
    models_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / 'app' / 'models'
    fixed_files = []
    
    for py_file in models_dir.glob('*.py'):
        if py_file.name not in ['__init__.py', 'base.py']:
            fixed = fix_tablename_in_model_file(py_file)
            if fixed:
                fixed_files.append(py_file.name)
    
    return fixed_files

def import_all_models():
    """Import all model classes to register with Base.metadata"""
    models_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / 'app' / 'models'
    imported_models = []
    
    for py_file in models_dir.glob('*.py'):
        if py_file.name not in ['__init__.py', 'base.py']:
            module_name = f"app.models.{py_file.stem}"
            try:
                module = importlib.import_module(module_name)
                
                # Find all classes that inherit from Base
                for name, obj in inspect.getmembers(module):
                    if inspect.isclass(obj) and isinstance(obj, DeclarativeMeta) and obj.__name__ != 'Base':
                        imported_models.append(obj.__name__)
            except Exception as e:
                logger.error(f"Error importing {module_name}: {e}")
    
    return imported_models

def check_database_connection():
    """Check if database connection is working"""
    try:
        # Try to connect to the database
        connection = engine.connect()
        connection.close()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def table_exists(table_name):
    """Check if a table exists in the database"""
    inspector = sa_inspect(engine)
    return table_name in inspector.get_table_names()

def safe_create_tables():
    """Create tables safely without data loss"""
    try:
        # Check database connection first
        if not check_database_connection():
            logger.error("Cannot proceed without database connection")
            return False
            
        # Fix model files if needed
        fixed_files = find_and_fix_model_files()
        if fixed_files:
            logger.info(f"Fixed models: {', '.join(fixed_files)}")
        
        # Import all models to register with Base.metadata
        imported_models = import_all_models()
        logger.info(f"Imported {len(imported_models)} models: {', '.join(imported_models)}")
        
        # Check existing tables
        inspector = sa_inspect(engine)
        existing_tables = inspector.get_table_names()
        logger.info(f"Found {len(existing_tables)} existing tables")
        
        # Create missing tables - this is safe and won't modify existing tables/data
        Base.metadata.create_all(bind=engine)
        logger.info("Table creation/verification completed")
        
        # Get updated list of tables
        inspector = sa_inspect(engine)
        tables = inspector.get_table_names()
        
        # Calculate newly created tables
        new_tables = set(tables) - set(existing_tables)
        if new_tables:
            logger.info(f"Created {len(new_tables)} new tables: {', '.join(new_tables)}")
        else:
            logger.info("No new tables needed to be created")
            
        logger.info("Database initialization completed successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        return False

if __name__ == "__main__":
    if safe_create_tables():
        sys.exit(0)
    else:
        sys.exit(1)