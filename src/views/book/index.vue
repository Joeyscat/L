<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddBook">添加书籍</el-button>

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
          <span>{{ row.author ? (row.author.family_name+row.author.first_name) : "" }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="40px" align="center" label="类型">
        <template slot-scope="{row}">
          <span>{{ (row.genre.map(g => genreMap.get(g._id))).join(", ") }}</span>
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
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleEdit(scope)">删除</el-button>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑书籍':'添加书籍'">
      <el-form :model="book" label-width="80px" label-position="left">
        <el-form-item label="书名">
          <el-input v-model="book.title" placeholder="书名" />
        </el-form-item>
        <el-form-item label="作者">
          <el-drag-select v-model="authorIds" style="width:100%;" placeholder="请选择">
            <el-option
              v-for="item in authorList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-drag-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-drag-select v-model="genreIds" style="width:100%;" multiple placeholder="请选择">
            <el-option
              v-for="item in genreList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-drag-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="book.summary" placeholder="简洁" />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="book.isbn" placeholder="ISBN" />
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
import { deepClone } from "@/utils";
import { parseTime } from "@/utils/index.js";
import { fetchList, addBook, updateBook } from "@/api/book";
import { fetchList as fetchAuthorList } from "@/api/author";
import { fetchList as fetchGenreList } from "@/api/genre";
import ElDragSelect from "@/components/DragSelect";
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
  components: { Pagination, ElDragSelect },
  data() {
    return {
      book: Object.assign({}, defaultBook),
      bookList: [],
      authorList: [],
      authorIds: [],
      genreList: [],
      genreMap: new Map(),
      genreIds: [],
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
    this.getAuthors();
    this.getGenres();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        console.log(response);
        this.bookList = response.data.items;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },

    getAuthors() {
      this.listLoading = true;
      fetchAuthorList().then(response => {
        console.log(response);
        this.authorList = response.data.items;
        this.listLoading = false;
      });
    },
    getGenres() {
      this.listLoading = true;
      fetchGenreList().then(response => {
        console.log(response);
        this.genreList = response.data.items;
        this.genreList.forEach(g => this.genreMap.set(g._id, g.name));
        this.listLoading = false;
      });
    },

    handleAddBook() {
      this.authorIds = [];
      this.genreIds = [];
      this.book = Object.assign({}, defaultBook);
      this.dialogType = "new";
      this.dialogVisible = true;
    },
    handleEdit(scope) {
      this.dialogType = "edit";
      this.dialogVisible = true;
      this.book = deepClone(scope.row);
      this.authorIds = this.book.author ? [this.book.author._id] : [];
      this.genreIds = [];
      let gen = this.book.genre;
      if (gen) {
        gen.forEach(g => {
          this.genreIds.push(g._id);
        });
      }
    },
    async confirmBook() {
      const isEdit = this.dialogType === "edit";

      this.authorList.forEach(author => {
        if (author._id === this.authorIds[0]) {
          this.book.author = author;
        }
      });

      this.book.genre = [];
      this.genreIds.forEach(_id => {
        this.book.genre.push({ _id, name: "" });
      });

      if (isEdit) {
        console.log("update book ", this.book);
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
