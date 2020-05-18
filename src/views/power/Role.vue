<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 添加角色 -->
        <el-row>
            <el-col>
                <el-button type="primary">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区域 -->
         <el-table :data="rolelist" border stripe>
             <el-table-column type= "expand">
                 <template slot-scope="scope">
                     <el-row :class="['bdbottom', i1===0 ? 'bdtop' : '','vcenter']"  v-for="(item1,i1) in scope.row.children" :key="item1.id">
                         <!-- 一级权限 -->
                         <el-col :span="5">
                            <el-tag closable @close="removeRight(scope.row,item1.id)">
                                {{item1.authName}}  
                            </el-tag> 
                            <i class="el-icon-caret-right"></i>
                         </el-col>
                         <!-- 二三级权限 -->
                         <el-col :span="19">
                             <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="['vcenter',i2===0?'':'bdtop']">
                                 <!-- 二级权限 -->
                                 <el-col  :span="6">
                                     <el-tag type="success" closable @close="removeRight(scope.row,item2.id)">{{item2.authName}}</el-tag> 
                                     <i class="el-icon-caret-right"></i>
                                 </el-col>
                                 <!-- 三级权限 -->
                                 <el-col :span="18">
                                     <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRight(scope.row,item3.id)">
                                         {{item3.authName}}
                                     </el-tag>
                                 </el-col>
                             </el-row>
                         </el-col>
                     </el-row>

                 </template>
             </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table> 
    </el-card>
    <!-- 打开分配权限的对话框 -->
    <el-dialog  title="分配权限" :visible.sync="setRightdialogVisible"
     width="50%" @close="setRightDialogClose">
    <!-- 树形控件 -->
    <el-tree :data="rightslist" ref="treeRef" :props="treeProps" show-checkbox 
    node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
    <span slot="footer" class="dialog-footer">
    <el-button @click="setRightdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights" >确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
import http from '../../http/http'
export default {
    data(){
        return{
            rolelist:[],
            setRightdialogVisible:false,
            rightslist:[],
            // 树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            // 默认选中的节点id值
            defKeys:[],
            roleId:''
        }
    },
    created () {
        this.getRoleList()
        
    },
    methods: {
        async getRoleList(){
            const {data:res} = await http.get('/roles')
            console.log(res);
            // if(res.meta.status!==200) {return this.$message.error('获取失败')}
            this.rolelist = res.data
        },
        async  removeRight(role,rightid){
                const confirmR = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
            }).catch((err) => err)
            if(confirmR !=='confirm'){
                return this.$message.info('取消删除')
            }
            // console.log('确认删除');
            const{data:res} = await http.delete(`/roles/${role.id}/rights/${rightid}`)
            // console.log(res)
            //重新调用接口
            //  这个是容易重新渲染全部的，为了防止关闭全部关闭，把服务器返回的数据直接赋值到当前角色的children，防止全部刷新
            //  this.getRoleList()
            role.children = res.data
        },
        async showSetRightDialog(role){
            this.roleId = role.id
        //  获取权限数据
            const {data:res}= await http.get('/rights/tree')
            //    console.log(res)
                this.rightslist =res.data
                // console.log(this.rightslist)
                // 递归获取三级权限的id 
                this.getLeafKeys(role,this.defKeys)

                this.setRightdialogVisible=true
        },
        // 通过递归的形式，获取角色下所有的三级权限管理的id，并保存到defKeys数组中，
        getLeafKeys(node,arr){
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item  => this.getLeafKeys(item,arr))
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClose(){
            this.defKeys = []
        },
        //点击为权限分配权限
       async  allotRights(){
        //    点击确定时获取到全选和半选的Id值合并成完整的数组,然后把数组做一次字符串拼接发起请求
            const keys=[...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()]
            // console.log(keys)
            const idstr=keys.join(',')
           const {data:res} =  await http.post(`/roles/${this.roleId}/rights`,{rids:idstr})
           this.$message.success('分配权限成功')
           this.getRoleList()
           this.setRightdialogVisible=false
        }
    }
            
        
}
</script>
<style scoped>
.el-tag{
    margin:7px
}
.bdtop{
    border-top: solid 1px #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}

</style>