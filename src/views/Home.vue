<template>
    <el-container class="home">
        <el-header>
                <div>电商后台管理系统</div>
                <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse? '64px':'200px'" >
                <div class="toggle-btn" @click="toggleCollapse">|||</div>
                <el-menu router :collapse="isCollapse" :collapse-transition="false" unique-opened background-color="#333744" text-color="#fff"
                 active-text-color="#409EEF" :default-active="activePath">
                    <!--:index="item.id+''"这个是打开一级权限防止重复  必须为字符串-->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                       <!-- 一级菜单 -->
                        <template slot="title">
                            <i :class="iconslist[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                            <!-- 开启路由模式 需要index -->
                            <!-- 二级菜单 -->
                        <el-menu-item  :index="'/'+subitem.path" 
                        v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/'+subitem.path)">
                            <template slot="title"><i class="el-icon-menu"></i>
                                <span> {{subitem.authName}}</span>  
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>

</template>

<script>
import http from '../http/http'
export default {
    data(){
        return{
            //左侧菜单数据
            menulist:[],
            // 对象遍历可以用[]
            iconslist:{
                125:'iconfont icon-weibiaoti561',
                103:'iconfont icon-weibiaoti561',
                101:'iconfont icon-weibiaoti561',
                102:'iconfont icon-weibiaoti561',
                145:'iconfont icon-weibiaoti561'      
            },
            isCollapse:false,
            // 被激活的链接地址
            activePath:''
        }
    },
    created(){
        this.getMenuList()
        this.activePath=window.sessionStorage.getItem('activePath')

    },
    methods: {
        logout(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        async getMenuList(){
            const {data:res}= await http.get('/menus')
            if(res.meta.status !==200) return this.$message.err(res.meta.msg)
            this.menulist=res.data                 
        },
         //点击按钮切换菜单折叠
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        },
        // 保存链接的激活状态
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath',activePath)
            this.activePath=activePath
        }
        
    }
}

</script>
<style  lang="less"  scoped>
.home{
     height: 100%;
}
.el-header{
    background-color: #373d41;
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding-left: 0;
   div{
       color: #fff;
       font-size: 22px;
   }
}

.el-aside{
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
    background-color: #EAEDE1;
}
.toggle-btn{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>