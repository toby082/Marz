import React, { useState, useEffect } from 'react';
import PageWrapper from '../PageWrapper';
import { Order,Product } from '../../components/interfaces';

const DATA_STATES = {
  waiting: 'WAITING',
  loaded: 'LOADED',
  error: 'ERROR'
};

const ProductsPage = () => {
  /*
    TODO:
      When the drag ends we want to keep the status persistant across logins. 
      Instead of modifying the data locally we want to do it serverside via a post
      request
  */
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingState, setLoadingState] = useState(DATA_STATES.waiting);

  useEffect(() => {
    getProducts();
  }, []);

  function updateProduct(ProductID: number, Status:string) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ProductID: ProductID, OrderStatus: Status })
  };

    fetch('http://localhost:5001/api/products/update_status', requestOptions)
        .then(response => response.json())
        .then(data => getProducts());
}

  function getProducts() {
    setLoadingState(DATA_STATES.waiting);

    fetch('http://localhost:5001/api/products/all')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setProducts(data.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold text-white">Products</h1>
      <div className="bg-neutral-500 w-full grid grid-cols-3 gap-4 m-2">
        <div className="m-2 ">
                <div className="grid grid-cols-4 gap-4 bg-neutral-300 mb-2 text-center align-middle h-12 rounded p-3">
                  <div>ID</div>
                  <div>Name</div>
                  <div>PhotoURL</div>
                  <div>Status</div>
                  <div>
                  <button ></button>
                  </div>
                </div>
        </div>
      </div>

      <div className="bg-neutral-500 w-full grid grid-cols-3 gap-4 m-2">
        <div className="m-2 ">
          {products
            .map((product) => {
              return (
                <div className="grid grid-cols-4 gap-4 bg-neutral-300 mb-2 text-center align-middle h-auto rounded p-3 justify-center">
                  <div>{product.ProductID}</div>
                  <div>{product.ProductName}</div>
                  <div><img src={product.ProductPhotoURL} alt="image" /></div>
                  <div>{product.ProductStatus}</div>
                  <div>
                  <button onClick={async => {
                    updateProduct(product.ProductID, 'Cancelled')
                  }}></button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProductsPage;
