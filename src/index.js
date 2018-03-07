export default class Service
{
    static get status()
    {
        return {
            none: 999,
            executed: 1,
            completed: 2,
        }
    }

    static get httpStatusMap()
    {
        return {
            '999': '客戶端程式發生問題',
            '400': '伺服器不能或不會處理該請求',
            '401': '您的登入憑證已經過期，請重新登入系統',
            '403': '您沒有權限進行此項操作',
            '404': '請求資源不存在',
            '405': '請求方法不可用於目前請求資源',
            '408': '請求超時',
            '419': '您的驗證憑證已經過期，請重整頁面',
            '422': '欄位驗證不合法',
            '500': '系統發生錯誤，請聯絡作者處理',
        }
    }

    static getErrorMessage(error, isForceOrigin = false)
    {
        if (_.isNil(error)) {
            return null
        }

        if (!isForceOrigin && _.has(Service.httpStatusMap, Service.getErrorStatusCode(error))) {
            return Service.httpStatusMap[Service.getErrorStatusCode(error)]
        }

        if (!_.has(error, 'message')) {
            return '發生錯誤'
        }
        
        if (_.isEmpty(error.message)) {
            return '發生錯誤'
        }

        return error.message
    }

    static fetchedSchema()
    {
        return {
            conditions: null,
            pagination: {
                data: [],
                meta: {
                    current_page: 1,
                    per_page: 10,
                    last_page: 0,
                    total: 0,
                    from: 0,
                    to: 0,
                },

                links: {},
            },
            orderBy: {},
        }
    }

    static requestSchema()
    {
        return {
            status: Service.status.none,
            error: null,
            success: null,
        }
    }

    static getRequest(url, params, { successCommit, failCommit })
    {
        return new Promise((resolve, reject) => {
            axios.get(url, { params })
                .then(res => Service.successHandle(res, { resolve, reject }, { successCommit, failCommit }))
                .catch(error => Service.failHandle(error, { resolve, reject }, { successCommit, failCommit }))
        })
    }

    static postRequest(url, params, { successCommit, failCommit })
    {
        return new Promise((resolve, reject) => {
            axios.post(url, params)
                .then(res => Service.successHandle(res, { resolve, reject }, { successCommit, failCommit }))
                .catch(error => Service.failHandle(error, { resolve, reject }, { successCommit, failCommit }))
        })
    }

    static putRequest(url, params, { successCommit, failCommit })
    {
        return new Promise((resolve, reject) => {
            axios.put(url, params)
                .then(res => Service.successHandle(res, { resolve, reject }, { successCommit, failCommit }))
                .catch(error => Service.failHandle(error, { resolve, reject }, { successCommit, failCommit }))
        })
    }

    static deleteRequest(url, params, { successCommit, failCommit })
    {
        return new Promise((resolve, reject) => {
            axios.delete(url, params)
                .then(res => Service.successHandle(res, { resolve, reject }, { successCommit, failCommit }))
                .catch(error => Service.failHandle(error, { resolve, reject }, { successCommit, failCommit }))
        })
    }

    static successHandle(res, { resolve, reject }, { successCommit, failCommit })
    {
        if (res.data.error) {
            failCommit(res.data.error)

            return reject(res.data.error)
        }

        successCommit(res)

        return resolve(res)
    }

    static failHandle(error, { resolve, reject }, { successCommit, failCommit })
    {
        failCommit(error)

        return reject(error)
    }

    static getRequestExecutedParams()
    {
        return {
            status: Service.status.executed,
            success: null,
            error: null,
        }
    }

    static getRequestSuccessParams(res)
    {
        return {
            status: Service.status.completed,
            success: res,
        }
    }

    static getRequestErrorParams(error)
    {
        return {
            status: Service.status.completed,
            error: error,
        }
    }

    static getRequestRestParams()
    {
        return {
            status: Service.status.none,
        }
    }

    static getData({ data })
    {
        return data
    }

    static getPackageData(res)
    {
        return Service.getData(res).data
    }

    static getMessage({ data })
    {
        return data.message
    }

    static isErrorhHasResponse(error) 
    {
        return error && _.has(error, 'response')
    }

    static getResponseFromError(error)
    {
        if (!Service.isErrorhHasResponse(error)) {
            return null
        }

        return error.data.error.response
    }

    static getErrorStatusCode(error)
    {
        if (!_.has(error, 'response.status')) {
            return 999
        }

        return error.response.status
    }

    static isUnprocessableEntityResponse(error)
    {
        return _.isEqual(422, Service.getErrorStatusCode(error))
    }

    static datatableConvertParams(query)
    {
        let params = _.assign({}, query)

        params.page = Service.offsetToPage(query.offset, query.limit)
        params.per_page = query.limit

        return params
    }

    static offsetToPage(offset, limit)
    {
        return _.isEqual(Number(offset), 0) ? 1 : (Math.floor(offset/limit) + 1)
    }
}