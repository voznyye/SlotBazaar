"""Initial migration

Revision ID: e24a140a3c62
Revises: a03b23eebb1c
Create Date: 2025-06-07 11:07:47.936743

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e24a140a3c62'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to create initial tables."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=100), nullable=False),
        sa.Column('balance', sa.Numeric(precision=10, scale=2), nullable=False, server_default='100.00'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    
    # Create transactions table
    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('transaction_type', sa.String(length=20), nullable=False),
        sa.Column('game_name', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create game_sessions table
    op.create_table(
        'game_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('game_name', sa.String(length=50), nullable=False),
        sa.Column('bet_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('win_amount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('game_outcome', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_transactions_user_id'), 'transactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_game_sessions_user_id'), 'game_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_game_sessions_game_name'), 'game_sessions', ['game_name'], unique=False)


def downgrade() -> None:
    """Downgrade schema by dropping created tables."""
    # Drop indexes
    op.drop_index(op.f('ix_game_sessions_game_name'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_user_id'), table_name='game_sessions')
    op.drop_index(op.f('ix_transactions_user_id'), table_name='transactions')
    
    # Drop tables in reverse order of creation
    op.drop_table('game_sessions')
    op.drop_table('transactions')
    op.drop_table('users')
