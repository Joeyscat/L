import request from '@/utils/request'

const baseURL = 'http://127.0.0.1:3000/api'

export function fetchList(query) {
  return request({
    baseURL,
    url: '/catalog/books',
    method: 'get',
    params: query
  })
}

export function fetchBook(id) {
  return request({
    baseURL,
    url: `/catalog/books/${id}`,
    method: 'get'
  })
}

export function updateBook(data) {
  return request({
    baseURL,
    url: `/catalog/books`,
    method: 'put',
    data
  })
}

export function addBook(data) {
  return request({
    baseURL,
    url: '/catalog/books',
    method: 'post',
    data
  })
}

export function deleteBook(id) {
  return request({
    baseURL,
    url: `/catalog/books/${id}`,
    method: 'delete'
  })
}

