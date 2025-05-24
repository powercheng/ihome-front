import request from '@/utils/request'

// 查询estimate列表
export function listEstimate(query) {
  return request({
    url: '/order/estimate/list',
    method: 'get',
    params: query
  })
}

// 查询estimate详细
export function getEstimate(id) {
  return request({
    url: '/order/estimate/' + id,
    method: 'get'
  })
}

// 新增estimate
export function addEstimate(data) {
  return request({
    url: '/order/estimate',
    method: 'post',
    data: data
  })
}

// 修改estimate
export function updateEstimate(data) {
  return request({
    url: '/order/estimate',
    method: 'put',
    data: data
  })
}

// 删除estimate
export function delEstimate(id) {
  return request({
    url: '/order/estimate/' + id,
    method: 'delete'
  })
}
