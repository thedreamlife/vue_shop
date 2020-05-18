<template>
  <div>
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
       <el-card>
           <el-alert title="添加商品商品信息" type="info"  center show-icon :closable="false"></el-alert>
           <el-steps :active="activeIndex - 0" align-center finish-status="success">
                <el-step title="基本信息" ></el-step>
                <el-step title="商品参数" ></el-step>
                <el-step title="商品属性" ></el-step>
                <el-step title="商品图片" ></el-step>
                <el-step title="商品内容" ></el-step>
                <el-step title="完成" ></el-step>
          </el-steps>
          <el-form :model="addForm" :rules="addrules" ref="ruleForm" label-position="top" label-width="100px">
           <el-tabs  v-model="activeIndex"  :tab-position="'left'" 
           :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name" >
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                     <el-form-item label="商品重量" prop="goods_weight" >
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                     <el-form-item label="商品数量" prop="goods_number" >
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader
                            v-model="addForm.goods_cat"
                            :options="cateList"
                            :props="cateProps"
                            @change="handleChange">
                        </el-cascader>
                    </el-form-item>
               
                </el-tab-pane>
                <el-tab-pane label="商品参数"  name="1">
                    <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox border :label="item1" v-for="(item1,i) in item.attr_vals" :key="i"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                     
                </el-tab-pane>
                <el-tab-pane label="商品属性"  name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片"  name="3">
                    <!-- action图片要上传到后台的API地址 -->
                    <el-upload
                            action="http://119.23.53.78:8888/api/private/v1/upload"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                           
                            list-type="picture"
                            :headers="headerobj"
                            :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容"  name="4">
                    <quill-editor v-model="addForm.goods_introduce">
                    </quill-editor>
                    <el-button type="primary" class="btn" @click="add">添加商品</el-button>
                </el-tab-pane>
           </el-tabs>
           </el-form>
       </el-card>
       <!-- 图片预览 -->
       <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%">
           <img :src="previewPath" alt="">
            
    </el-dialog>
  </div>
</template>

<script>
import http from '../../http/http'
import _ from 'lodash'
export default {
    data () {
        return {
            activeIndex:'0',
            // 添加商品的表单数据
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                //商品所属的分类数组
                goods_cat:[],
                // 图片数组
                pics:[],
                goods_introduce:'',
                attrs:[]
            },
            addrules:{
                goods_name:[
                     { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price:[
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                 goods_weight:[
                     { required: true, message: '请输入商品重量', trigger: 'blur' }
                 ],
                 goods_number:[
                     { required: true, message: '请输入商品数量', trigger: 'blur' }
                 ],
                 goods_cat:[
                      { required: true, message: '请选择商品分类', trigger: 'blur' }
                 ]
            },
            // 商品分类列表
            cateList:[],
            cateProps:{
                expandTrigger: 'hover',
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            // 动态参数列表数据
            manyTableData:[],
            // 静态属性列表数据
            onlyTableData :[],
            // 图片上传组件的请求头对象
            headerobj:{
                Authorization:window.sessionStorage.getItem('token')
        
            },
            previewPath:'',
            previewVisible:false
        }
    },
    created () {
        this.getCateList()
        
    },
    methods: {
        async getCateList(){
            const{data:res}=await http.get('/categories')
            this.cateList = res.data
       },
       //级联选中项变化，会触发的函数
       handleChange(){
        //    console.log(this.addForm.goods_cat);
        if(this.addForm.goods_cat.length!==3){
            this.addForm.goods_cat=[]
        }

       },
        beforeTabLeave(activeName,oldActiveName){
            // console.log();
            if(oldActiveName==='0' && this.addForm.goods_cat.length!==3){
               this.$message.error('请先选择商品分类')
               return false
            }
            
        },
        async tabClicked(){
            // 证明访问动态参数面板
            if(this.activeIndex==='1'){
              const {data:res} =await http.get(`/categories/${this.cate_id}/attributes`,{params:{sel:'many'}})
            //   console.log(res.data);  
             res.data.forEach(item=>{
             item.attr_vals = item.attr_vals.length!==0?item.attr_vals.split(' '):[]})
            this.manyTableData = res.data   
            console.log(res.data);
            }else if(this.activeIndex==='2')
            {
                const {data:res} =await http.get(`/categories/${this.cate_id}/attributes`,{params:{sel:'only'}})
                 this.onlyTableData = res.data
                console.log(res);
  
            }
                
        },
        // 处理图片预览效果
        handlePreview(file){
            console.log(file.response.data.url);
            this.previewPath = file.response.data.url
            console.log(previewPath)
            this.previewVisible=true

        },
        // 处理移除图片的操作
        handleRemove(file){
            // console.log(file);
            // 获取将要删除的临时路径
            const filePath = file.response.data.tmp_path

            // 从数组中找到脱对应的索引值
            const i = this.addForm.pics.findIndex(i=>i.pic===filePath)
            // 调用数组的splice方法把图片信息对象从pics数组中移除
            this.addForm.pics.splice(i,1)
            console.log( this.addForm);
            

        },
        handleSuccess(res){
            // console.log(res);
            // 先拼接得到一个图片信息对象
            const picInfo = {pic:res.data.tmp_path}
            // console.log(picInfo);
            // 将图片信息添加到数组zhong
            this.addForm.pics.push(picInfo)
        },
         add(){
            this.$refs.ruleForm.validate(async valid=>{
                if(!valid){ return this.$message.error('请填写必要 的表单')
                }
               const form =  _.cloneDeep(this.addForm)
               form.goods_cat = form.goods_cat.join(',')
            //    处理动态参数
            this.manyTableData.forEach(item=>{
                const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
                this.addForm.attrs.push(newInfo)
            })
            // 处理静态属性
            this.onlyTableData.forEach(item=>{
                const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
                this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs
            const {data,res}=await http.post('/goods',form)
            this.$router.push('/goods')
         })
        }
    },
    computed: {
        cate_id(){
            // if(this.addForm.goods_cat.length===3){
            //     return this.addForm.goods_cat[2]
            // }
            // return null
        return   this.addForm.goods_cat.length===3?this.addForm.goods_cat[2]:null
           
        }
        
    }
}

</script>
<style scoped>
.el-steps {
    margin: 15px 0;
    
}
.btn{
    margin-top: 15px;
}

</style>