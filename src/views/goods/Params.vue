<template>
  <div>
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <!-- 警告区域 -->
        <el-alert title="注意：只允许为第三分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
        <!-- 选择商品分类区域 -->
        <el-row class="cat_opt">
            <el-col>
                <span>选择商品分类</span>
                <!-- 选择商品分类区域 -->
                <!-- v-model把选中的值双向绑定到数组中 -->
                <el-cascader
                    v-model="selecterCateKeys"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange">
                </el-cascader>

            </el-col>
        </el-row>
        <!-- tab页签区域 -->
         <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isBtnDisabled" @click="adddialogVisible=true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                            @close="handleClose(index,scope.row)">
                                {{item}}
                            </el-tag>
                            <!-- 输入文本框 -->
                            <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                >
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                        </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column> 
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete"  size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
           
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                 <el-button type="primary" :disabled="isBtnDisabled" @click="adddialogVisible=true">添加属性</el-button>
                   <!-- 动态参数表格 -->
                <el-table :data="onlyTableData" border stripe>
                    <el-table-column type="expand">
                        <!-- 静态属性表格 -->
                         <template slot-scope="scope">
                            <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                            @close="handleClose(index,scope.row)">
                                {{item}}
                            </el-tag>
                            <!-- 输入文本框 -->
                            <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                >
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                        </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="属性名称" prop="attr_name"></el-table-column> 
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete"  size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
         </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
     <el-dialog  :title="this.activeName ==='many'?'添加动态参数':'添加静态属性'"
        :visible.sync="adddialogVisible"
        width="50%" @close="addDialogClose" >
            <el-form ref="ruleform" :model="addForm" label-width="80px" :rules="addFormRules">
                <el-form-item :label="this.activeName ==='many'?'动态参数':'静态属性'" 
                prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="adddialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams" >确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改对话框 -->
     <el-dialog  :title="this.activeName ==='many'?'修改动态参数':'修改静态属性'"
            :visible.sync="editdialogVisible"
            width="50%" @close="editDialogClose" >
        <el-form ref="editruleform" :model="editForm" label-width="80px" :rules="editFormRules">
            <el-form-item :label="this.activeName ==='many'?'动态参数':'静态属性'" 
                prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams" >确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import http from '../../http/http'
export default {
    data(){
        return{
            catelist:[],
            // 级联选择框的配置对象
            cateProps:
                {   expandTrigger:"hover" ,
                    value:'cat_id',
                    label:'cat_name',
                    children:'children'
                },
            
            // 级联选择框双向绑定到的值
            selecterCateKeys:[],
            // 被激活的页签的名称
            activeName:'many',
            manyTableData:[],
            onlyTableData:[],
            adddialogVisible:false,
            addForm:{},
            addFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
            editdialogVisible:false,
            editForm:{},
            editFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
        
        }
    },
        created(){
            this.getCateList()
        },
        methods: {
            async getCateList(){
               const{data:res} =  await http.get('/categories')
                // console.log(res); 
            this.catelist=res.data         
            },
            // 选中的项变化会触发这个函数
             handleChange(){
                // console.log(this.selecterCateKeys);
                //    证明选的不是三级分类
                this.getParamsdata()
               
            },
            //tab页签点击事件处理函数
            handleClick(){
                console.log(this.activeName);
                this.getParamsdata()

            },
            // 获取参数列表的
            async getParamsdata(){
                if(this.selecterCateKeys.length!==3){
                  this.selecterCateKeys=[]
                  this.manyTableData=[]
                  this.onlyTableData=[]
                  return
                }
                console.log(this.selecterCateKeys);
                // 根据所选分类的Id和当前所处的面板获取对应的参数
               const {data:res} =  await http.get(`/categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
                console.log(res)
                // 字符串转换成数组split()不改变原始字符串
                res.data.forEach(item=>{
                    item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[]
                     //添加控制文本框的显示与隐藏
                     item.inputVisible = false
                    //  文本框输入的值
                     item.inputValue = ''
                     })
                
                if(this.activeName==='many'){
                    this.manyTableData = res.data
                }else{
                    this.onlyTableData = res.data
                }
            },
            // 监听添加对话框的关闭事件
            addDialogClose(){
                this.$refs.ruleform.resetFields()
            },
            addParams(){
                // 校验的是prop属性
                this.$refs.ruleform.validate(async valid=>{
                    if(!valid) return
                    const {data:res}=await http.post(`/categories/${this.cateId}/attributes`,{
                        attr_name:this.addForm.attr_name,
                        attr_sel:this.activeName
                    })
                    // console.log(res)
                    this.$message.success('添加成功')
                    this.adddialogVisible=false
                })

            },
            // 点击按钮展示修改对话框
            async showEditDialog(id){
                const{data:res}=await http.get(`/categories/${this.cateId}/attributes/${id}`,{params:{attr_sel:this.activeName}})
                console.log(res)
                 this.editForm = res.data
                this.editdialogVisible=true
            },
            // 重置修改表单
            editDialogClose(){
                this.$refs.editruleform.resetFields()
            },
            // 点击按钮修改操作
            editParams(){
                this.$refs.editruleform.validate(async valid=>{
                    if(!valid) return
                    const{data:res}=await http.put(`/categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                        attr_name:this.editForm.attr_name,
                        attr_sel:this.activeName
                    })
                    console.log(res)
                    this.getParamsdata()
                    this.editdialogVisible=false
                })


            },
            // 删除参数
        async removeParams(id){
                const res =  await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    })
                    // 用户取消删除操作
                if(res !== 'confirm'){
                    return this.$message.info('您已取消删除')
                }
               await http.delete(`/categories/${this.cateId}/attributes/${id}`)
                this.$message.success('删除参数成功')
                this.getParamsdata()
        },
            // 文本失去焦点或摁下enter都会触发
           async handleInputConfirm(row){
                 if(row.inputValue.trim().length==0){
                     row.inputValue=''
                     row.inputVisible=false
                     return
                 }
                //  如果没有return 则证明输入内容需要做后续处理
                //  console.log('ok')
                // 数组里面添加输入的值然后重置输入框内容为空然后再变成false
                 row.attr_vals.push(row.inputValue.trim())
                 row.inputValue =''
                 row.inputVisible=false
                //  需要发起请求，保存这次操作
                 this.saveAttrVals(row)
            },
            // 点击按钮显示文本框
            showInput(row){
                row.inputVisible = true
                // 让文本框自动获得焦点 nextTick当页面上元素被重新渲染智慧，才会知道回调函数中的代码
                this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });

            },
            // 删除对应的可选项
            handleClose(index,row){
                row.attr_vals.splice(index,1)
                 this.saveAttrVals(row)

            },
            // 将对atttr_vals操作保存在数据库
            async saveAttrVals(row){
                 //  需要发起请求保存操作
                const {data:res}=await http.put(`/categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name:row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals:row.attr_vals.join(' ')
                })
                console.log(res)
            }
        },
       
        computed: {
            // 如果按钮需要禁用返回true
            isBtnDisabled(){
                if(this.selecterCateKeys.length!==3){
                    return true
                }
                return false
            },
            // 当前选中的三级分类的Id
            cateId(){
                if(this.selecterCateKeys.length ===3){
                    return this.selecterCateKeys[2]
                }
                return null
            },
            
        }
    }



</script>
<style scoped>
.cat_opt{
    margin: 15px 0;
}
.el-tag{
    margin: 20px;
}
.input-new-tag{
    width: 80px;
}
</style>