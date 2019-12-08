import request from '@/utils/request'

export function fetchList(query) {
  return request({
    baseURL: 'http://127.0.0.1:3000/api',
    url: '/catalog/books',
    method: 'get',
    params: query
  })
}

export function fetchBook(id) {
  return request({
    url: `/catalog/books/${id}`,
    method: 'get'
  })
}

export function updateBook(data) {
  return request({
    url: `/catalog/books`,
    method: 'put',
    data
  })
}

export function addBook(data) {
  return request({
    url: '/catalog/books',
    method: 'post',
    data
  })
}
