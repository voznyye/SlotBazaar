import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  Casino,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';

const TransactionType = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  GAME_WIN: 'game_win',
  GAME_LOSS: 'game_loss',
};

const TransactionTypeConfig = {
  [TransactionType.DEPOSIT]: {
    label: 'Deposit',
    color: 'success',
    icon: <TrendingUp />,
  },
  [TransactionType.WITHDRAW]: {
    label: 'Withdraw',
    color: 'error',
    icon: <TrendingDown />,
  },
  [TransactionType.GAME_WIN]: {
    label: 'Game Win',
    color: 'success',
    icon: <Casino />,
  },
  [TransactionType.GAME_LOSS]: {
    label: 'Game Loss',
    color: 'error',
    icon: <Casino />,
  },
};

const Transactions = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/user/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.type.toLowerCase().includes(searchLower) ||
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const isAsc = order === 'asc';
      if (orderBy === 'date') {
        return isAsc
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (orderBy === 'amount') {
        return isAsc ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            Transaction History
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'amount'}
                      direction={orderBy === 'amount' ? order : 'asc'}
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={TransactionTypeConfig[transaction.type]?.icon}
                        label={TransactionTypeConfig[transaction.type]?.label}
                        color={TransactionTypeConfig[transaction.type]?.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color:
                          transaction.type === TransactionType.DEPOSIT ||
                          transaction.type === TransactionType.GAME_WIN
                            ? 'success.main'
                            : 'error.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {transaction.type === TransactionType.DEPOSIT ||
                      transaction.type === TransactionType.GAME_WIN
                        ? '+'
                        : '-'}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Transactions;
