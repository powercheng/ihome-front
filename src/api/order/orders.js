import request from '@/utils/request'

// 查询orders列表
export function listOrders(query) {
  return request({
    url: '/order/orders/list',
    method: 'get',
    params: query
  })
}

// 查询orders详细
export function getOrders(id) {
  return request({
    url: '/order/orders/' + id,
    method: 'get'
  })
}

// 新增orders
export function addOrders(data) {
  return request({
    url: '/order/orders',
    method: 'post',
    data: data
  })
}

// 修改orders
export function updateOrders(data) {
  return request({
    url: '/order/orders',
    method: 'put',
    data: data
  })
}

// 删除orders
export function delOrders(id) {
  return request({
    url: '/order/orders/' + id,
    method: 'delete'
  })
}
