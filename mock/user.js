import Mock from 'mockjs'

const List = []
const count = 100

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    created_time: +Mock.Random.date('T'),
    name: '@first',
    sign: '@title(5, 10)',
    level: '@integer(1, 3)',
    avatar: 'http://localhost:3000/images/avatar.gif',
    status: 'active',
    roles: ['editor']
  }))
}

const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'http://localhost:3000/images/avatar.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'http://localhost:3000/images/avatar.gif',
    name: 'Normal Editor'
  }
}

export default [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // get user list
  {
    url: '/user/list',
    type: 'get',
    response: config => {
      const { level, type, title: name, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (level && item.level !== +level) return false
        if (type && item.type !== type) return false
        if (name && item.title.indexOf(name) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/user/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const user of List) {
        if (user.id === +id) {
          return {
            code: 20000,
            data: user
          }
        }
      }
    }
  },
  // add user
  {
    url: '/user',
    type: 'post',
    response: {
      code: 20000,
      data: {
        id: Mock.mock('@integer(300, 5000)')
      }
    }
  },

  // update user
  {
    url: '/user/[A-Za-z0-9]',
    type: 'put',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  },

  // delete user
  {
    url: '/user/[A-Za-z0-9]',
    type: 'delete',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  }
]
