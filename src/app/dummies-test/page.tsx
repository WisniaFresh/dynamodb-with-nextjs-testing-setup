'use client'; // Ensures this is a client-side component

import BackButton from '@/frontend/components/BackButton';
import Button from '@/frontend/components/Button';
import DummiesGrid from '@/frontend/components/DummiesGrid';
import DummyForm from '@/frontend/components/DummyForm';
import Pagination from '@/frontend/components/Pagination';
import { URLS } from '@/frontend/constants/urls';
import { DummyType } from '@/schemas/dummySchema';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

type DummiesPagination = {
  limit: number;
  page: number;
  totalDocuments: number;
  totalPages: number;
};

const DummyPage = () => {
  const [dummies, setDummies] = useState<DummyType[]>([]);
  const [pagination, setPagination] = useState<DummiesPagination>();

  const fetchHandler = () => {
    axios
      .get<{
        dummies: DummyType[];
        pagination: DummiesPagination;
      }>(
        URLS.API.dummies({ queryParams: '?status=active&created_at_sort=desc' })
      )
      .then((res) => {
        console.log('fetchHandler res', res);

        const dummies = res.data.dummies;
        setDummies(dummies);
        setPagination(res.data.pagination);
      });
  };

  useEffect(() => {
    console.log('mount');
    fetchHandler();
  }, []);

  const postHandler = (dummyFormValues: DummyType) => {
    console.log(new Date());
    console.log('dummyFormValues', dummyFormValues);
    return axios
      .post<{
        dummy: DummyType;
      }>(URLS.API.dummies({}), dummyFormValues)
      .then((res) => {
        console.log('postHandler data', res.data);
        if (res.data.dummy) {
          setDummies((prev) => [res.data.dummy, ...prev]);
        }
      })
      .catch((err) => {
        console.log('POST err', err);
        console.log('in catch:', err.response.data.message);
      });
  };

  const onPageChangeHandler = (newPage: number) => {
    axios
      .get<{ dummies: DummyType[]; pagination: DummiesPagination }>(
        URLS.API.dummies({
          queryParams: `?status=active&created_at_sort=desc&page=${newPage}`,
        })
      )
      .then((res) => {
        setDummies(res.data.dummies);
        setPagination(res.data.pagination); // Update pagination details in state
      })
      .catch((error) => console.error('Error fetching paginated data:', error));
  };

  return (
    <div className='flex w-full flex-col items-center justify-center bg-gray-900'>
      <div className='flex w-full flex-col items-start bg-gray-900 p-6'>
        <BackButton />
      </div>
      <h1 className='m-8 text-4xl font-bold text-blue-600'>
        Simple Page with a Button
      </h1>
      <DummyForm onSubmit={postHandler} />
      <div className='mb-4'>
        <Button onAction={fetchHandler}>Reload</Button>
      </div>
      {dummies.length > 0 && <DummiesGrid dummies={dummies} />}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          maxPages={pagination.totalPages}
          onPageChange={onPageChangeHandler}
        />
      )}
    </div>
  );
};

export default DummyPage;
