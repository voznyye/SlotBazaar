"""Add is_verified column to users table

Revision ID: add_is_verified_column
Revises: 
Create Date: 2025-06-07 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision: str = 'add_is_verified_column'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add is_verified column to users table if it doesn't exist."""
    # Получаем соединение с базой данных
    connection = op.get_bind()
    
    # Проверяем наличие колонки is_verified
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'is_verified' not in columns:
        print("Adding is_verified column...")
        op.add_column('users',
            sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false')
        )
    else:
        print("Column is_verified already exists, skipping...")
    
    # Проверяем наличие колонки last_login
    if 'last_login' not in columns:
        print("Adding last_login column...")
        op.add_column('users',
            sa.Column('last_login', sa.DateTime(timezone=True), nullable=True)
        )
    else:
        print("Column last_login already exists, skipping...")


def downgrade() -> None:
    """Remove added columns."""
    # В функции downgrade мы проверяем наличие колонок перед их удалением
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'is_verified' in columns:
        op.drop_column('users', 'is_verified')
    
    if 'last_login' in columns:
        op.drop_column('users', 'last_login')