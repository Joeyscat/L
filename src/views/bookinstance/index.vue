<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddBookinstance">添加书籍实例</el-button>

    <el-table
      v-loading="listLoading"
      :data="bookinstanceList"
      border
      fit
      highlight-current-row
      style="width: 100%;margin-top:30px;"
    >
      <el-table-column min-width="40px" align="center" label="书名">
        <template slot-scope="{row}">
          <span>{{ row.book.title }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="40px" align="center" label="作者">
        <template slot-scope="{row}">
          <span>{{ row.book.author.name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60px" align="center" label="出版社">
        <template slot-scope="{row}">
          <span>{{ row.imprint }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="40px" align="center" label="状态">
        <template slot-scope="{row}">
          <span>{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60px" align="center" label="归还时间">
        <template slot-scope="{row}">
          <span>{{ formatDate(row.due_back) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleEdit(scope)">删除</el-button>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑书籍实例':'添加书籍实例'">
      <el-form :model="bookinstance" label-width="80px" label-position="left">
        <el-form-item label="书籍">
          <el-select v-if="dialogType!=='edit'" v-model="bookinstance.book._id" placeholder="请选择">
            <el-option
              v-for="item in bookList"
              :key="item._id"
              :label="item.title"
              :value="item._id">
            </el-option>
          </el-select>
          <el-input v-if="dialogType==='edit'" v-model="bookinstance.book.title" disabled/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="bookinstance.status" placeholder="请选择">
            <el-option
              v-for="item in status"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="bookinstance.imprint" placeholder="出版社"/>
        </el-form-item>
        <el-form-item label="归还时间">
          <el-date-picker
            v-model="bookinstance.due_back"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            placeholder="Select date and time"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmBook">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone, formatDate } from '@/utils'
import {
  fetchList,
  addBookinstance,
  updateBookinstance
} from '@/api/bookinstance'
import { fetchList as fetchBookList } from '@/api/book'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const defaultBookinstance = {
  _id: '',
  book: {},
  status: '',
  imprint: '',
  due_back: ''
}

export default {
  name: 'BookinstanceList',
  components: { Pagination },
  data() {
    return {
      bookinstance: Object.assign({}, defaultBookinstance),
      bookinstanceList: [],
      bookList: [],
      bookIds: [],
      total: 0,
      status: ['可供借阅', '馆藏维护', '已借出'],
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
    this.getBooks()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
        this.bookinstanceList = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },

    getBooks() {
      this.listLoading = true
      fetchBookList().then(response => {
        console.log(response)
        this.bookList = response.data.items
        this.listLoading = false
      })
    },

    handleAddBookinstance() {
      this.bookinstance = Object.assign({}, defaultBookinstance)
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.bookinstance = deepClone(scope.row)
    },
    async confirmBook() {
      const isEdit = this.dialogType === 'edit'

      if (isEdit) {
        console.log('update bookinstance ', this.bookinstance)
        await updateBookinstance(this.bookinstance)
        for (let index = 0; index < this.bookinstanceList.length; index++) {
          if (this.bookinstanceList[index]._id === this.bookinstance._id) {
            this.bookinstanceList.splice(
              index,
              1,
              Object.assign({}, this.bookinstance)
            )
            break
          }
        }
      } else {
        const { data } = await addBookinstance(this.bookinstance)
        this.bookinstance = data
        this.bookinstanceList.push(this.bookinstance)
      }

      const { _id, title } = this.bookinstance
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
        <div>Book ID: ${_id}</div>
        <div>Book Title : ${title}</div>
      `,
        type: 'success'
      })
    },
    formatDate(date) {
      return formatDate(date)
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
