<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card >
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryParams.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible=true" >添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态">
                <!-- 作用域插槽 绑定这一行-->
                <template v-slot="scope">
                    <!-- {{scope.row}} 拿出这一条的信息-->
                    <el-switch v-model="scope.row.mg_state" @change="userState(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" >
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" circle @click="showEditDialog(scope.row.id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" circle @click="removeUser(scope.row.id)"></el-button>
                     <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" circle @click="setRole(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="queryParams.pagenum"
                :page-sizes="[1,2,5,10]"
                :page-size="queryParams.pagesize"
                layout="total,sizes, prev, pager, next,jumper"
                :total="total">
                </el-pagination>        
    </el-card>
    <!-- 添加用户对话框 -->
     <!-- 控制对话框显示与隐藏 -->
    <el-dialog title="添加用户"  :visible.sync="addDialogVisible"
     width="50%" @close="dealogClosed">
                <!-- 内容主题区域  prop验证规则属性-->
                <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                         <el-input v-model="addForm.username"></el-input>
                     </el-form-item>
                     <el-form-item label="密码" prop="password">
                         <el-input v-model="addForm.password"></el-input>
                     </el-form-item>
                     <el-form-item label="邮箱" prop="email">
                         <el-input v-model="addForm.email"></el-input>
                     </el-form-item>
                     <el-form-item label="手机号" prop="mobile">
                         <el-input v-model="addForm.mobile"></el-input>
                     </el-form-item>
                </el-form>
                <!-- 内容底部 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog  title="编辑用户" :visible.sync="editdialogVisible"
     width="50%" @close="editDialogClosed">
    <span>
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
    </span>
    <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配角色的对话框 -->
 <el-dialog  title="分配角色" :visible.sync="setRoledialogVisible"
     width="50%" @close="setRoleClosed">
    <div>
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
            <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
                </el-option>
            </el-select>
        </p>
    </div>
    <span slot="footer" class="dialog-footer">
    <el-button @click="setRoledialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo" >确 定</el-button>
  </span>
</el-dialog>

  </div>
</template>

<script>
import http from '../../http/http'
export default {
    data(){
         // 验证邮箱的校验规则
            var checkEmail = (rule,value,cb)=>{
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if (regEmail.test(value)){
                    return cb()
                }
                cb(new Error('请输入合法邮箱'))
            }
            var checkMobile =(rule,value,cb)=>{
                const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if(regMobile.test(value)){
                    return cb()
                }
                cb(new Error('请输入合法手机号'))
            }
        return{
        queryParams:{
            query:'',
            pagenum:1,
            // 当前每页显示多少条
            pagesize:2
        },
        userList:[],
        total:0,
        // 控制添加用户对话框的显示隐藏
        addDialogVisible:false,
        // 添加用户的表单数据
        addForm:{
            username:'',
            password:'',
            email:'',
            mobile:''
        },
        // 添加用户的表单验证规则对象
        addFormRules: {
           username: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
           password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10个字符', trigger: 'blur' }
          ],
           email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator:checkEmail,trigger:'blur'}
          ],
           mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
             {validator:checkMobile,trigger:'blur'}
          ]
        },
        // 控制编辑用户对话框的显示隐藏
        editdialogVisible:false,
        editForm:{},
        editFormRules:{
            email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator:checkEmail,trigger:'blur'}
          ],
           mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
             {validator:checkMobile,trigger:'blur'}
          ]
        } ,
        // 分配角色的显示与隐藏
        setRoledialogVisible:false,
        // 需要被分配角色用户信息
        userInfo:{},
        // 所有角色数据列表
        rolesList:[],
        // 已选中的角色id
        selectedRoleId:''
        } 
    },
    created () {
        this.getUserList()
    },
    methods:{
        async getUserList(){
            const {data:res} = await http.get('/users', {params:this.queryParams})
            //  console.log(res.data);
            this.userList = res.data.users
            this.total=res.data.total     
        },
        // 监听pagesize事件改变
        // 当你点击1条出现一条，点击两条出现2条
        handleSizeChange(newSize){
            // console.log(e);
            this.queryParams.pagesize=newSize
            // 根据最新的pagesize重新发起数据请求获取最新的数据 
            this.getUserList()
        },
        // 当前页码事件发生改变
        handleCurrentChange(pageNum){
            // console.log();
            this.queryParams.pagenum = pageNum;
            this.getUserList()
        },
        // 监听switch开关状态的改变 拿到最新的状态然后请求接口存入数据库中
        async userState(userinfo){
            // console.log(userinfo);
            const {data:res}=await http.put(`/users/${userinfo.id}/state/${userinfo.mg_state}`)
            // console.log(res);
            if(res.meta.status!==200){
            userinfo.mg_state=!userinfo.mg_state
            return  this.$message.error('更新用户状态失败')
            }
            this.$message.success('更新状态成功')
        },
        // 表单重置
        dealogClosed(){
            this.$refs.addForm.resetFields()
        },
        // 点击按钮添加新用户
        addUser(){
            // 预验证
            this.$refs.addForm.validate(async(valid)=>{
                // console.log(valid);  //true false
                if(!valid) return 
                const{data:res} = await http.post('/users',this.addForm)
                if(res.meta.status!==201){
                    this.$message.error('添加失败')
                }
                this.$message.success('添加成功')
                // 隐藏添加用户对话框
                this.addDialogVisible=false
                // 重新获取用户列表
                this.getUserList()
            })
        },
        // 编辑用户对话框
        async showEditDialog(id){
            this.editdialogVisible=true
            const {data:res} = await http.get(`/users/${id}`)
            console.log(res);
            this.editForm = res.data
        },
        // 监听修改用户对话框关闭事件
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        editUserInfo(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return
                // 可以从刚刚请求过的查看用户信息列表中获取值
               const {data:res} = await http.put(`/users/${this.editForm.id}`,
               {email:this.editForm.email,
               mobile:this.editForm.mobile})
                if(res.meta.status !==200) {return this.$message.error('更新用户信息失败')}
                // 关闭对话框
                this.editdialogVisible=false
                // 刷新数据列表
                this.getUserList()
                // 提示成功
                this.$message.success('更新用户成功')
           })
        },
       async removeUser(id){
           console.log(id);
           
            const res = await this.$confirm('该用户是否删除?', '提示', 
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=> err);
            // console.log(res);
            if(res !== 'confirm'){
                return this.$message.info('已取消删除')
            }
           const {data : result} =  await http.delete(`/users/${id}`)
           console.log(result);
           
           if(result.meta.status!==200){
               return this.$message.error('删除用户失败')
           }
           this.$message.success('删除用户成功')
           this.getUserList()
            
        },
       async setRole(userInfo){
            this.userInfo = userInfo
            // 在展示对话框之前，获取所有的角色列表
            const {data:res}=await http.get('/roles')
            this.rolesList = res.data
            this.setRoledialogVisible=true
        },
        async saveRoleInfo(){
            if(!this.selectedRoleId){
                return this.$massage.error('请选择要分配的角色')
            }
            const {data:res} = await http.put('/users/${this.userInfo.id}/role',{rid:this.selectedRoleId})
            // console.log(res)
            this.$message.success('更新用户角色成功')
            this.getUserList()
            this.setRoledialogVisible =false
        },
        // 监听角色对话框关闭事件
        setRoleClosed(){
            this.selectedRoleId = ''
            this.userInfo = {}
        }
    }
}

</script>
<style scoped>
.el-breadcrumb{
    margin-bottom: 15px;
    font-size: 12px;
}
.el-card{
    box-shadow: 0 1px 1px rgba(0,0,0,0.15);
}
.el-table{
    margin-top: 15px;
    font-size: 12px;
}
</style>