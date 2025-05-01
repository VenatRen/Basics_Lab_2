import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/books', {
          credentials: 'include',
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          setBooks(data);
        } else {
          setError('Unexpected data format');
        }
      } catch (error) {
        console.error(error);
        setError('Failed to fetch books');
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (bookId) => {
    try {
      await fetch(`http://localhost:8000/api/books/${bookId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setBooks(books.filter(book => book.id !== bookId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (bookId) => {
    navigate(`/books/edit/${bookId}`);
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>Book List</h2>
      <ul>
        {books.map(book => (
          <li key={book.id} className="book-item">
            <div className="book-info">
              <strong>{book.title}</strong> by {book.author} ({book.publishedYear})
            </div>
            <div className="book-actions">
              <button className="small-btn" onClick={() => handleEdit(book.id)}>Edit</button>
              <button className="small-btn" onClick={() => handleDelete(book.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookList;
