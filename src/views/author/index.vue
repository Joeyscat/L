<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddAuthor">添加作者</el-button>

    <el-table
      v-loading="listLoading"
      :data="authorList"
      border
      fit
      highlight-current-row
      style="width: 100%;margin-top:30px;"
    >
      <el-table-column min-width="120px" align="center" label="作者名">
        <template slot-scope="{row}">
          <span>{{ row.family_name+row.first_name }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" align="center" label="年代">
        <template slot-scope="{row}">
          <span>{{formatDate(row.date_of_birth) }} ~ {{formatDate(row.date_of_death) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="220">
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑作者':'添加作者'">
      <el-form :model="author" label-width="80px" label-position="left">
        <el-row>
          <el-col :span="10">
            <el-form-item label-width="80px" label="姓名:">
              <el-input v-model="author.family_name" placeholder="姓" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label-width="80px" label>
              <el-input v-model="author.first_name" placeholder="名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item label-width="80px" label="年龄:" class="postInfo-container-item">
              <el-date-picker
                v-model="author.date_of_birth"
                type="datetime"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="Select date and time"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label-width="80px" label="~" class="postInfo-container-item">
              <el-date-picker
                v-model="author.date_of_death"
                type="datetime"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="Select date and time"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmAuthor">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone, parseTime, formatDate } from "@/utils";
import { fetchList, addAuthor, updateAuthor } from "@/api/author";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

const defaultAuthor = {
  id: "",
  name: "",
  date_of_birth_formatted: "",
  date_of_death_formatted: "",
  description: "",
  routes: []
};

export default {
  name: "AuthorList",
  components: { Pagination },
  data() {
    return {
      author: Object.assign({}, defaultAuthor),
      authorList: [],
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
        this.authorList = response.data.items;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },

    handleAddAuthor() {
      this.author = Object.assign({}, defaultAuthor);
      this.dialogType = "new";
      this.dialogVisible = true;
    },
    handleEdit(scope) {
      this.dialogType = "edit";
      this.dialogVisible = true;
      this.author = deepClone(scope.row);
    },
    handleDelete(scope) {
      this.dialogType = "delete";
      this.dialogVisible = true;
      this.author = deepClone(scope.row);
    },
    async confirmAuthor() {
      const isEdit = this.dialogType === "edit";

      if (isEdit) {
        await updateAuthor(this.author);
        for (let index = 0; index < this.authorList.length; index++) {
          if (this.authorList[index]._id === this.author._id) {
            this.authorList.splice(index, 1, Object.assign({}, this.author));
            break;
          }
        }
      } else {
        const { data } = await addAuthor(this.author);
        this.author._id = data._id;
        this.authorList.push(this.author);
      }

      const { _id, name } = this.author;
      this.dialogVisible = false;
      this.$notify({
        title: "成功",
        dangerouslyUseHTMLString: true,
        message: `
<!--          <div>作者 ID: ${_id}</div>-->
          <div>作者名: ${name}</div>
        `,
        type: "success"
      });
    },
    formatDate(date) {
      return formatDate(date)
    }
  },
  computed: {}
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
