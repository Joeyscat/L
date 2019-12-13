import request from '@/utils/request'

const baseURL = 'http://127.0.0.1:3000/api'

export function fetchList(query) {
  return request({
    baseURL,
    url: '/catalog/authors',
    method: 'get',
    params: query
  })
}

export function searchByName(query) {
  return request({
    baseURL,
    url: '/catalog/authorsByName',
    method: 'get',
    params: query
  })
}

export function fetchAuthor(id) {
  return request({
    baseURL,
    url: `/catalog/authors/${id}`,
    method: 'get'
  })
}

export function updateAuthor(data) {
  return request({
    baseURL,
    url: `/catalog/authors`,
    method: 'put',
    data
  })
}

export function addAuthor(data) {
  return request({
    baseURL,
    url: '/catalog/authors',
    method: 'post',
    data
  })
}

export function deleteAuthor(id) {
  return request({
    baseURL,
    url: `/catalog/authors/${id}`,
    method: 'delete'
  })
}
