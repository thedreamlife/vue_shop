<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showaddCatedialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格 -->

        <tree-table class="tree-table" :data="catelist" :columns="columns" 
            :selection-type="false" :expand-type="false" show-index
            index-text="#" border>
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted === false"></i>
                <i class="el-icon-error" v-else style="color:red"></i>
            </template>
            <template slot="sort" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
            <template slot="opt">
                <el-button type="primary" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
        </tree-table> 
        <!--  分页--> 
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="queryInfo.pagenum"
                :page-sizes="[3,5,10]"
                :page-size="queryInfo.pagesize"
                layout="total,sizes, prev, pager, next,jumper"
                :total="total">
        </el-pagination>       
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog  title="标题分类" :visible.sync="addCatedialogVisible"
     width="50%" 
     @close="addCatedialogClosed">
    <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px" >
        <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
         <el-form-item label="父级分类">
             <!-- options指定数据源 -->
              <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="cascaderProps"
                @change="parentCateChange" clearable change-on-select>
            </el-cascader>
        </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
   
  </div>
</template>

<script>
import http from '../../http/http'
export default {
    data(){
       return{
            queryInfo:{
            type:3,
            pagenum:1,
            pagesize:5
        },
        catelist:[],
        total:0,
        // 为table指定列的定义
        columns:[
            {
                label:'分类名称',
                prop:'cat_name'
            },
            {
                label:'是否有效',
                // 将当前列定义为模板列
                type:'template',
                // 当前这一列使用的模板名称
                template:'isok'
            },
            {
                label:'排序',
                // 将当前列定义为模板列
                type:'template',
                // 当前这一列使用的模板名称
                template:'sort'
            },
            {
                label:'操作',
                // 将当前列定义为模板列
                type:'template',
                // 当前这一列使用的模板名称
                template:'opt'
            }
        ],
        addCatedialogVisible:false,
        addForm:{
            cat_name:'',
            // 分类的父级Id
            cat_pid:0,
            // 分类等级默认要添加一级分类
            cat_level:0
        },
        rules:{
            cat_name:[
                { required: true, message: '请输入分类名称', trigger: 'blur' },
            ]
        },
        parentCateList:[],
        // 指定级联选择器的配置对象
        cascaderProps:{
            expandTrigger: "hover",
            value:'cat_id',
            label:'cat_name',
            children:'children'
        },
        // 选中的父级分类数组
        selectedKeys:[]

       }
    },
    created () {
        this.getCateList()
        
    },
    methods: {
        async getCateList(){
           const {data:res}= await http.get('/categories',{params:this.queryInfo})
           console.log(res);
           this.catelist = res.data.result
           this.total = res.data.total
        },
        //监听pagesize的改变
        handleSizeChange(newSize){
            //console.log(newSize);
            this.queryInfo.pagesize=newSize
            this.getCateList()
        },
        handleCurrentChange(newNum){
            this.queryInfo.pagenum = newNum
            this.getCateList()
        },
        // 点击按钮，展示添加分类的按钮
        async showaddCatedialog(){
            // 获取父级分类的数据列表
            this.getParentCateList()
            
            this.addCatedialogVisible=true
        },
        // 获取父级分类的数据列表
        async getParentCateList(){
           const{data:res}= await http.get('/categories',{params:{
                type:2 }})
            // console.log(res.data); 
            this.parentCateList=res.data
            // console.log(parentCateList)     
        },
        // 选择项发送编号触发这个函数
        parentCateChange(){
            // console.log(this.selectedKeys);
            // 如果selectKeys数组中的Length>0证明选中父级分类
            if(this.selectedKeys.length>0){
                // 父级分类的id
               this.addForm.cat_pid  = this.selectedKeys[this.selectedKeys.length-1]
               // 当前父类的等级赋值
               this.addForm.cat_level=this.selectedKeys.length
                return
            }else{
                 this.addForm.cat_pid=0,
                 this.addForm.cat_level=0
            }
        },
        async addCate(){
             console.log(this.addForm);
            // 预验证
            this.$refs.addFormRef.validate(valid=>{
                if(!valid) return 
            })
            const{data:res} = await http.post('/categories',this.addForm)
            this.$message.success('添加分类成功')
            this.getCateList()
            this.addCatedialogVisible=false
        },
        // 关闭对话框的关闭事件，重置表单数据
        addCatedialogClosed(){
            this.$refs.addFormRef.resetFields()
            this.selectedKeys=[]
            this.addForm.cat_level=0
            this.addForm.cat_pid=0
        }
    }

}

</script>
<style>
.tree-table{
    margin-top: 15px;
}
</style>