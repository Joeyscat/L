import request from '@/utils/request'

const baseURL = 'http://127.0.0.1:3000/api'

export function fetchList(query) {
  return request({
    baseURL,
    url: '/catalog/bookinstances',
    method: 'get',
    params: query
  })
}

export function fetchBookinstance(id) {
  return request({
    baseURL,
    url: `/catalog/bookinstances/${id}`,
    method: 'get'
  })
}

export function updateBookinstance(data) {
  return request({
    baseURL,
    url: `/catalog/bookinstances`,
    method: 'put',
    data
  })
}

export function addBookinstance(data) {
  return request({
    baseURL,
    url: '/catalog/bookinstances',
    method: 'post',
    data
  })
}
