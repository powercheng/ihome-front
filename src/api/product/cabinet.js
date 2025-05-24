import request from '@/utils/request'

// 查询cabinet列表
export function listCabinet(query) {
  return request({
    url: '/product/cabinet/list',
    method: 'get',
    params: query
  })
}

// 查询cabinet详细
export function getCabinet(id) {
  return request({
    url: '/product/cabinet/' + id,
    method: 'get'
  })
}

// 新增cabinet
export function addCabinet(data) {
  return request({
    url: '/product/cabinet',
    method: 'post',
    data: data
  })
}

// 修改cabinet
export function updateCabinet(data) {
  return request({
    url: '/product/cabinet',
    method: 'put',
    data: data
  })
}

// 删除cabinet
export function delCabinet(id) {
  return request({
    url: '/product/cabinet/' + id,
    method: 'delete'
  })
}


export function importCabinets(file) {
  return request({
    url: '/product/cabinet/importData',
    method: 'post'
  })
}

export function queryByManuAndCode(query) {
  return request({
    url: '/product/cabinet/queryByManuAndCode',
    method: 'get',
    params: query
  })
}