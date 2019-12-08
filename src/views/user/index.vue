<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddUser">New User</el-button>

    <el-table
      v-loading="listLoading"
      :data="userList"
      border
      fit
      highlight-current-row
      style="width: 100%;margin-top:30px;"
    >
      <el-table-column align="center" label="ID" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180px" align="center" label="Registed At">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="220px" align="center" label="Username">
        <template slot-scope="{row}">
<!--          <router-link :to="'/user/edit/'+row.id" class="link-type">-->
            <span>{{ row.name }}</span>
<!--          </router-link>-->
        </template>
      </el-table-column>

      <el-table-column width="100px" label="Level">
        <template slot-scope="scope">
          <svg-icon
            v-for="n in +scope.row.level"
            :key="n"
            icon-class="star"
            class="meta-item__icon"
          />
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">{{ row.status }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(scope)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit User':'New User'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item label="Name">
          <el-input v-model="user.name" placeholder="User Name"/>
        </el-form-item>
        <el-form-item label="Level">
          <el-select v-model="user.level" placeholder="User Level">
            <el-option label="Level 1" value="1"></el-option>
            <el-option label="Level 2" value="2"></el-option>
            <el-option label="Level 3" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="user.status" placeholder="User Status">
            <el-option label="active" value="active"></el-option>
            <el-option label="inactivated" value="inactivated"></el-option>
            <el-option label="diable" value="diable"></el-option>
            <el-option label="deleted" value="deleted"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="confirmUser">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { fetchList, addUser, updateUser } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const defaultUser = {
  id: '',
  name: '',
  description: '',
  routes: []
}

export default {
  name: 'UserList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      user: Object.assign({}, defaultUser),
      userList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      routes: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.userList = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },

    handleAddUser() {
      this.user = Object.assign({}, defaultUser)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = deepClone(scope.row)
    },
    async confirmUser() {
      const isEdit = this.dialogType === 'edit'

      if (isEdit) {
        await updateUser(this.user.id, this.user)
        for (let index = 0; index < this.userList.length; index++) {
          if (this.userList[index].id === this.user.id) {
            this.userList.splice(index, 1, Object.assign({}, this.user))
            break
          }
        }
      } else {
        const { data } = await addUser(this.user)
        this.user.id = data.id
        this.userList.push(this.user)
      }

      const { id, name } = this.user
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
          <div>User ID: ${id}</div>
          <div>User Name: ${name}</div>
        `,
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
