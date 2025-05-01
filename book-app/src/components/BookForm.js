import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BookForm = ({ bookToEdit = null }) => {
  const [title, setTitle] = useState(bookToEdit ? bookToEdit.title : '');
  const [author, setAuthor] = useState(bookToEdit ? bookToEdit.author : '');
  const [publishedYear, setPublishedYear] = useState(bookToEdit ? bookToEdit.publishedYear : '');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setPublishedYear(bookToEdit.publishedYear);
    }
  }, [bookToEdit]);

  const handleSubmit = async () => {
    try {
      const method = bookToEdit ? 'PUT' : 'POST';
      const url = bookToEdit ? `http://localhost:8000/api/books/${id}` : 'http://localhost:8000/api/books';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, publishedYear }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save book');
      }

      navigate('/books');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>{bookToEdit ? 'Edit Book' : 'Add Book'}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <input
        type="number"
        placeholder="Published Year"
        value={publishedYear}
        onChange={(e) => setPublishedYear(e.target.value)}
      />
      <button onClick={handleSubmit}>{bookToEdit ? 'Update' : 'Add'}</button>
    </div>
  );
};

export default BookForm;
