<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddBook">New Book</el-button>

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
          <span>{{ row.author_name }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="40px" align="center" label="类型">
        <template slot-scope="{row}">
          <span>{{ row.genres }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="60px" align="center" label="ISBN">
        <template slot-scope="{row}">
          <span>{{ row.isbn }}</span>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit Book':'New Book'">
      <el-form :model="book" label-width="80px" label-position="left">
        <el-form-item label="Name">
          <el-input v-model="book.title" placeholder="Book Title" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="confirmBook">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from "@/utils";
import { parseTime } from "@/utils/index.js";
import { fetchList, addBook, updateBook } from "@/api/book";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

const defaultBook = {
  genre: [],
  _id: "",
  title: "",
  summary: "",
  author: {},
  isbn: ""
};

export default {
  name: "BookList",
  components: { Pagination },
  data() {
    return {
      book: Object.assign({}, defaultBook),
      bookList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      routes: [],
      dialogVisible: false,
      dialogType: "new",
      checkStrictly: false,
      defaultProps: {
        children: "children",
        label: "title"
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        console.log(response);
        const items = response.data.items;
        this.bookList = items.map(item => {
          item.author_name = item.author ? item.author.name : "";
          let genres = "";
          item.genre.forEach(i => {
            genres += i.name + "，";
          });
          item.genres = genres.slice(0, -1);
        });
        this.bookList = items;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },

    handleAddBook() {
      this.user = Object.assign({}, defaultBook);
      this.dialogType = "new";
      this.dialogVisible = true;
    },
    handleEdit(scope) {
      this.dialogType = "edit";
      this.dialogVisible = true;
      this.user = deepClone(scope.row);
    },
    async confirmBook() {
      const isEdit = this.dialogType === "edit";

      if (isEdit) {
        await updateBook(this.book);
        for (let index = 0; index < this.bookList.length; index++) {
          if (this.bookList[index]._id === this.book._id) {
            this.bookList.splice(index, 1, Object.assign({}, this.book));
            break;
          }
        }
      } else {
        const { data } = await addBook(this.book);
        this.book._id = data._id;
        this.bookList.push(this.book);
      }

      const { _id, title } = this.book;
      this.dialogVisible = false;
      this.$notify({
        title: "Success",
        dangerouslyUseHTMLString: true,
        message: `
          <div>Book ID: ${_id}</div>
          <div>Book Title : ${title}</div>
        `,
        type: "success"
      });
    }
  }
};
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
