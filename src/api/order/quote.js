import request from '@/utils/request'

// 查询报价列表
export function listQuote(query) {
  return request({
    url: '/order/quote/list',
    method: 'get',
    params: query
  })
}

// 查询报价详细
export function getQuote(id) {
  return request({
    url: '/order/quote/' + id,
    method: 'get'
  })
}

// 新增报价
export function addQuote(data) {
  return request({
    url: '/order/quote',
    method: 'post',
    data: data
  })
}

// 修改报价
export function updateQuote(data) {
  return request({
    url: '/order/quote',
    method: 'put',
    data: data
  })
}

// 删除报价
export function delQuote(id) {
  return request({
    url: '/order/quote/' + id,
    method: 'delete'
  })
}
