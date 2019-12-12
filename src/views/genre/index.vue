<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddGenre">添加类型</el-button>

    <el-table
      v-loading="listLoading"
      :data="genreList"
      border
      fit
      highlight-current-row
      style="width: 100%;margin-top:30px;"
    >

<!--      <el-table-column min-width="180px" align="center" label="Registed At">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ scope.row.created_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->

      <el-table-column min-width="120px" align="center" label="类型名称">
        <template slot-scope="{row}">
            <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="220">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope)">删除</el-button>
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
      <el-form :model="genre" label-width="80px" label-position="left">
        <el-form-item label="Name">
          <el-input v-model="genre.name" placeholder="类型名称"/>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmGenre">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { fetchList, addGenre, updateGenre, deleteGenre } from '@/api/genre'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const defaultGenre = {
  id: '',
  name: '',
  description: '',
  routes: []
}

export default {
  name: 'GenreList',
  components: { Pagination },
  data() {
    return {
      genre: Object.assign({}, defaultGenre),
      genreList: [],
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
        this.genreList = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },

    handleAddGenre() {
      this.genre = Object.assign({}, defaultGenre)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.genre = deepClone(scope.row)
    },
    handleDelete(scope) {
      this.dialogType = 'delete'
      this.dialogVisible = true
      this.genre = deepClone(scope.row)
    },
    async confirmGenre() {
      const selectedId = this.genre._id
      if (this.dialogType === 'edit') {
        await updateGenre(this.genre)
        for (let index = 0; index < this.genreList.length; index++) {
          if (this.genreList[index]._id === selectedId) {
            this.genreList.splice(index, 1, Object.assign({}, this.genre))
            break
          }
        }
      } else if (this.dialogType === 'new') {
        const { data } = await addGenre(this.genre)
        this.genre._id = data._id
        this.genreList.push(this.genre)
      } else if (this.dialogType === 'delete') {
        const { data } = await deleteGenre(selectedId)
        for (let i = 0; i < this.genreList.length; i++) {
          const genre = this.genreList[i]
          if (genre._id === data.id) {
            this.genreList.splice(i, 1)
            break
          }
        }
      } else {
        console.error('这是啥操作？？')
      }

      const { _id, name } = this.genre
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
<!--          <div>类型 ID: ${_id}</div>-->
          <div>类型名称: ${name}</div>
        `,
        type: 'success'
      })
    },
    dialogTitle(dialogType) {
      return dialogType === 'edit' ? '编辑类型' : dialogType === 'new' ? '添加类型' : '删除类型'
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
