import React, { useState, useEffect } from 'react';
import axios from './axios';
import Swal from 'sweetalert2';
import './ProductList.css';

const categories = ['Electronics', 'Clothing', 'Furniture', 'Groceries', 'Books'];
const ITEMS_PER_PAGE = 3;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load products', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/products/${id}`);
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
        fetchProducts();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete product', 'error');
      }
    }
  };

  const handleUpdate = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="product-list">
      <div className="header-section">
        <h2>Product List</h2>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); 
            }}
          />
        </div>

        <button className="add-button" onClick={() => setIsModalOpen(true)}>Add Product</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-indicator">Loading products...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('category')} className="sortable">
                    Category {sortField === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('price')} className="sortable">
                    Price {sortField === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('stockQuantity')} className="sortable">
                    Stock {sortField === 'stockQuantity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No products found.</td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>৳ {product.price}</td>
                      <td className={product.stockQuantity < 5 ? 'low-stock' : ''}>{product.stockQuantity}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => handleUpdate(product)}>Edit</button>
                        <button className="action-btn delete" onClick={() => handleDelete(product.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={currentPage === i + 1 ? 'active' : ''}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <ProductForm
          onClose={() => {
            setIsModalOpen(false);
            setEditProduct(null);
            fetchProducts();
          }}
          onAdd={fetchProducts}
          editProduct={editProduct}
        />
      )}
    </div>
  );
};

const ProductForm = ({ onClose, onAdd, editProduct }) => {
  const lastCategory = localStorage.getItem('lastCategory') || '';
  const [product, setProduct] = useState(
    editProduct || { name: '', category: lastCategory, price: 0, stockQuantity: 0 }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if ((name === 'price' || name === 'stockQuantity') && value < 0) {
      Swal.fire('Error', `${name} cannot be negative.`, 'error');
      return;
    }

    setProduct({ ...product, [name]: name === 'price' || name === 'stockQuantity' ? Number(value) : value });

    if (name === 'category') {
      localStorage.setItem('lastCategory', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const action = editProduct ? 'update' : 'add';
    const result = await Swal.fire({
      title: `Confirm ${action}`,
      text: `Are you sure you want to ${action} this product?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        if (editProduct) {
          await axios.put(`/products/${editProduct.id}`, product);
          Swal.fire('Update!', 'Product has been deleted.', 'success');
        } else {
          await axios.post('/products', product);
          Swal.fire('Add!', 'Product has been deleted.', 'success');
        }
        onAdd();
        onClose();
      } catch (error) {
        Swal.fire('Error', 'Operation failed', 'error');
      }
    }
  };


  return (
    <div className="modal-overlay">
      <div className="product-form-modal">
        <div className="modal-header">
          <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={product.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={product.category} onChange={handleChange} required>
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={product.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">{editProduct ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductList;
