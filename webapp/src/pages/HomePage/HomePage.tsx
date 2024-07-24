import React, { useEffect } from "react";
import { useState } from "react";
import { DragDropContext } from 'react-beautiful-dnd';
import DraggableList from "../../components/DraggableList/DraggableList";
import Spinner from "../../components/Spinner/Spinner";
import { Order, OrderData } from "../../components/interfaces";
import { getInPipelineData, updateOrderStatus } from "../ApiHelper";
import PageWrapper from '../PageWrapper';

const DATA_STATES = {
  waiting: 'WAITING',
  loaded: 'LOADED',
  error: 'ERROR'
};

interface IdList {
  '0': string;
  '1': string;
  '2': string;
}

const ID_LIST_MAP: IdList = {
  '0': 'Queued',
  '1': 'InProgress',
  '2': 'QA'
};

const HomePage = () => {
  const [loadingState, setLoadingState] = useState(DATA_STATES.waiting);
  const [data, setData] = useState({Queued: [], InProgress: [], QA: []} as OrderData);
  console.log("[Debug] ~ file: HomePage.tsx:31 ~ HomePage ~ data:", data);

  const getOrders = async () => {
    setLoadingState(DATA_STATES.waiting);
    const { orderData, errorOccured } = await getInPipelineData();
    setData(orderData);
    setLoadingState(errorOccured ? DATA_STATES.error : DATA_STATES.loaded);
  };

  const updateOrder = async (order: Order) => {
    setLoadingState(DATA_STATES.waiting);
    const newOrderStatus = order.OrderStatus === 'QA' ? 'Complete' : 'Cancelled';
    const orderStatusUpdated = await updateOrderStatus(order, newOrderStatus);
    if (orderStatusUpdated) {
      const columnKey = order.OrderStatus as keyof OrderData
      setData({
        ...data,
        [columnKey]: data[columnKey].filter(
          (otherOrder: Order) => otherOrder.OrderID !== order.OrderID
        ),
      });
    }
    setLoadingState(DATA_STATES.loaded);
  };

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceKey = ID_LIST_MAP[source.droppableId as keyof IdList] as keyof OrderData;
    const sourceIndex = source.index;

    const destKey = ID_LIST_MAP[destination.droppableId as keyof IdList] as keyof OrderData;
    const destIndex = destination.index;

    if (sourceKey === destKey) {
      const sourceClone = Array.from(data[sourceKey]);
      const [removed] = sourceClone.splice(sourceIndex, 1);
      sourceClone.splice(destIndex, 0, removed);
      setData({ ...data, [sourceKey]: sourceClone });
    }
    else {
        const sourceClone = Array.from(data[sourceKey]);
        const destClone = Array.from(data[destKey]);
        const [removed] = sourceClone.splice(sourceIndex, 1);
        destClone.splice(destIndex, 0, removed);
        destClone[destIndex].OrderStatus = destKey;
        setData({
          ...data,
          [sourceKey]: sourceClone,
          [destKey]: destClone,
        });
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  let content;
  if (loadingState === DATA_STATES.waiting)
    content = (
      <div
        className="flex flex-row justify-center w-full pt-4"
        data-testid="loading-spinner-container"
      >
        <Spinner />
      </div>
    );
  else if (loadingState === DATA_STATES.loaded) 
    content = (
      <div
        className="flex flex-row justify-center w-full pt-4"
        data-testid="pipeline-container"
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <DraggableList
            ID='0'
            listTitle='Queued'
            removeOrder={(order: Order) => updateOrder(order)}
            items={data.Queued}
          />
          <DraggableList
            ID='1'
            listTitle='In Progess'
            removeOrder={(order: Order) => updateOrder(order)}
            items={data.InProgress}
          />
          <DraggableList
            ID='2'
            listTitle='QA'
            removeOrder={(order: Order) => updateOrder(order)}
            items={data.QA}
          />
        </DragDropContext>
      </div>
    );
  else
    content = (
      <div
        className="flex flex-row justify-center w-full pt-4 text-3xl font-bold text-white"
        data-testid="error-container"
      >
      <div className="bg-neutral-500 w-full grid grid-cols-3 gap-4 m-2">
        <div className="m-2 ">
          <h1 className="text-white text-lg m-2 font-bold">Queued</h1>
          {data.Queued
            .map((product) => {
              return (
                <div className="grid grid-cols-4 gap-4 bg-neutral-300 mb-2 text-center align-middle h-12 rounded p-3">
                  <div>{product.CustomerID}</div>
                  <div>{product.OrderID}</div>
                  <div>{product.ProductID}</div>
                  <div>
                  <button onClick={async => {
                    updateOrder(product)
                  }}><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="square-xmark" className="svg-inline--fa fa-square-xmark text-red-600 h-6 w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-testid="draggable-btn-6"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm79 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"></path></svg></button>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="m-2">
          <h1 className="text-white text-lg m-2 font-bold">In Progress</h1>
          {data.InProgress
            .map((product) => {
              return (
                <div className="grid grid-cols-4 gap-4 bg-neutral-300 mb-2 text-center align-middle h-12 rounded p-3">
                  <div>{product.CustomerID}</div>
                  <div>{product.OrderID}</div>
                  <div>{product.ProductID}</div>
                  <div>
                  <button onClick={async => {
                    updateOrder(product)
                  }}><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="square-xmark" className="svg-inline--fa fa-square-xmark text-red-600 h-6 w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-testid="draggable-btn-6"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm79 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"></path></svg></button>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="m-2">
          <h1 className="text-white text-lg m-2 font-bold">QA</h1>
          {data.QA
            .map((product) => {
              return (
                <div className="grid grid-cols-4 gap-4 bg-neutral-300 mb-2 text-center align-middle h-12 rounded p-3">
                  <div>{product.CustomerID}</div>
                  <div>{product.OrderID}</div>
                  <div>{product.ProductID}</div>
                  <div>
                  <button onClick={async => {
                    updateOrder(product)
                  }}>
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="square-check" className="svg-inline--fa fa-square-check text-green-600 h-6 w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-testid="draggable-btn-8"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      </div>
    );

  return (
    <PageWrapper>
      { content }
    </PageWrapper>
  );
}

export default HomePage;