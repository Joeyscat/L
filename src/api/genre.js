import request from '@/utils/request'

const baseURL = 'http://127.0.0.1:3000/api'

export function fetchList(query) {
  return request({
    baseURL,
    url: '/catalog/genres',
    method: 'get',
    params: query
  })
}

export function fetchGenre(id) {
  return request({
    baseURL,
    url: `/catalog/genres/${id}`,
    method: 'get'
  })
}

export function updateGenre(data) {
  return request({
    baseURL,
    url: `/catalog/genres`,
    method: 'put',
    data
  })
}

export function addGenre(data) {
  return request({
    baseURL,
    url: '/catalog/genres',
    method: 'post',
    data
  })
}
