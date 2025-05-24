import request from '@/utils/request'

// 查询color列表
export function listColor(query) {
  return request({
    url: '/product/color/list',
    method: 'get',
    params: query
  })
}

// 查询color详细
export function getColor(id) {
  return request({
    url: '/product/color/' + id,
    method: 'get'
  })
}

// 新增color
export function addColor(data) {
  return request({
    url: '/product/color',
    method: 'post',
    data: data
  })
}

// 修改color
export function updateColor(data) {
  return request({
    url: '/product/color',
    method: 'put',
    data: data
  })
}

// 删除color
export function delColor(id) {
  return request({
    url: '/product/color/' + id,
    method: 'delete'
  })
}
