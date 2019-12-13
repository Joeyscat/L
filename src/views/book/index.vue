<template>
  <div class="app-container">
<!--    <el-button type="primary" @click="handleAddBook">添加书籍</el-button>-->
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="书名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.isbn" placeholder="ISBN" style="width: 120px;" class="filter-item" @keyup.enter.native="handleFilter" />
<!--      <el-select v-model="listQuery.type" placeholder="类型" clearable class="filter-item" style="width: 130px">-->
<!--        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />-->
<!--      </el-select>-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAddBook">
        添加书籍
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="bookList"
      border
      fit
      highlight-current-row
      style="width: 100%;margin-top:30px;"
    >
      <el-table-column min-width="60px" align="center" label="书名">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="40px" align="center" label="作者">
        <template slot-scope="{row}">
          <span>{{ row.author ? (row.author.family_name+row.author.first_name) : '' }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="40px" align="center" label="类型">
        <template slot-scope="{row}">
          <span>{{ (row.genre.map(g => genreMap.get(g._id))).join(', ') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="60px" align="center" label="ISBN">
        <template slot-scope="{row}">
          <span>{{ row.isbn }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDeleteBook(scope)">删除</el-button>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle(dialogType)">
      <el-form :model="book" label-width="80px" label-position="left">
        <el-form-item label="书名">
          <el-input v-model="book.title" placeholder="书名"/>
        </el-form-item>
        <el-form-item label="作者">
          <el-select
            v-model="book.author._id"
            style="width:100%;"
            filterable
            remote
            placeholder="请输入关键词"
            no-data-text="找不到该作者"
            :remote-method="searchAuthors"
            :loading="loading">
            <el-option
              v-for="item in authorOptions"
              :key="item._id"
              :label="item.name"
              :value="item._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-drag-select v-model="currentGenreIds" style="width:100%;" multiple placeholder="请选择">
            <el-option
              v-for="item in genreList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-drag-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="book.summary" placeholder="简洁"/>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="book.isbn" placeholder="ISBN"/>
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
import { deepClone } from '@/utils'
import { fetchList, addBook, updateBook, deleteBook } from '@/api/book'
import { searchByName as searchAuthorByName } from '@/api/author'
import { fetchList as fetchGenreList } from '@/api/genre'
import ElDragSelect from '@/components/DragSelect'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves' // waves directive

const defaultBook = {
  genre: [],
  _id: '',
  title: '',
  summary: '',
  author: {},
  isbn: ''
}

export default {
  name: 'BookList',
  components: { Pagination, ElDragSelect },
  directives: { waves },
  data() {
    return {
      book: Object.assign({}, defaultBook),
      bookList: [],
      genreList: [],
      genreMap: new Map(),
      currentGenreIds: [],
      authorOptions: [],
      total: 0,
      loading: false,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        genre: undefined,
        isbn: undefined,
        sort: '+id'
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
    this.getGenres()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.bookList = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter(e) {
      console.log(e)
    },
    searchAuthors(query) {
      if (!query || !query.trim()) {
        return
      }
      this.loading = true
      searchAuthorByName({ name: query }).then(response => {
        this.authorOptions = response.data.items
        this.loading = false
      })
    },
    getGenres() {
      this.listLoading = true
      fetchGenreList().then(response => {
        this.genreList = response.data.items
        this.genreList.forEach(g => this.genreMap.set(g._id, g.name))
        this.listLoading = false
      })
    },

    handleAddBook() {
      this.currentGenreIds = []
      this.book = Object.assign({}, defaultBook)
      this.authorOptions = []
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.book = deepClone(scope.row)
      // 在作者选项框中绑定的是this.book.author._id -> el-select v-model="book.author._id", 所以选项数据中必须包含this.book.author,否则会直接显示_id
      this.authorOptions = [this.book.author]
      const genre = this.book.genre
      this.currentGenreIds = genre ? genre.map(g => g._id) : []
    },

    handleDeleteBook(scope) {
      this.dialogType = 'delete'
      this.dialogVisible = true
      this.book = deepClone(scope.row)
      const genre = this.book.genre
      this.currentGenreIds = genre ? genre.map(g => g._id) : []
    },

    async confirmBook() {
      const selectedId = this.book._id

      for (let i = 0; i < this.authorOptions.length; i++) {
        const author = this.authorOptions[i]
        if (author._id === this.book.author._id) {
          this.book.author = author
          break
        }
      }

      this.book.genre = this.currentGenreIds.map(_id => {
        return { _id }
      })

      if (this.dialogType === 'edit') {
        console.log(('edit', this.book))
        const { data } = await updateBook(this.book)
        this.book = data
        for (let index = 0; index < this.bookList.length; index++) {
          if (this.bookList[index]._id === selectedId) {
            this.bookList.splice(index, 1, Object.assign({}, this.book))
            break
          }
        }
      } else if (this.dialogType === 'new') {
        const { data } = await addBook(this.book)
        this.book = data
        this.bookList.push(this.book)
      } else if (this.dialogType === 'delete') {
        const { data } = await deleteBook(selectedId)
        for (let i = 0; i < this.bookList.length; i++) {
          if (this.bookList[i]._id === data.id) {
            this.bookList.splice(i, 1)
            break
          }
        }
      } else {
        console.error('这是啥操作？？')
      }

      const { _id, title } = this.book
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
    dialogTitle(dialogType) {
      return dialogType === 'edit' ? '编辑书籍' : dialogType === 'new' ? '添加书籍' : '删除书籍'
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
