<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
          <el-row >
              <el-col :span="8" >
                  <el-input placeholder="请输入内容"  clearable v-model="queryInfo.query" @clear="getOrderList" >
                    <el-button  icon="el-icon-search" slot="append" @click="getOrderList"></el-button>
                </el-input>
              </el-col>
          </el-row>
            <!-- 订单列表 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" >
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status==='1'" >已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" ></el-table-column>
                <el-table-column label="下单时间" prop="create_time" width="160px">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template >
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress" ></el-button>
                    </template>
                </el-table-column>
            </el-table> 
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="queryInfo.pagenum"
                :page-size="queryInfo.pagesize"
                :page-sizes="[5,10,15,20]"
                layout="total, prev, pager, next,jumper"
                :total="total">
                </el-pagination>
        </el-card>
        <!-- <el-dialog
            title="修改地址"
            :visible.sync="addressdialogVisible"
            width="50%" >
         <el-form :model="address" :rules="addressrules" ref="addressruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="省市区/县" prop="address1">
                <el-casccader :options="citydata"
                v-model="address.address1">
                </el-casccader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="address.address2"></el-input>
            </el-form-item>
         </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addressdialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="addressdialogVisible = false">确 定</el-button>
  </span>
</el-dialog> -->

<!-- 展示物流信息 -->
 <el-dialog
            title="物流进度"
            :visible.sync="progressdialogVisible"
            width="50%" >
         <el-timeline>
            <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
            </el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
        <el-button @click="progressdialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="progressdialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
import http from '../../http/http'
export default {
    data () {
        return {
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            orderList:[],
            total:0,
            addressdialogVisible:false,
            address:{
                address1:[],
                address1:''
            },
            addressrules:{
                address1:[
                     { required: true, message: '请选择省市区/县', trigger: 'blur' }
                ],
                 address2:[
                     { required: true, message: '请填写详细地址', trigger: 'blur' }
                ]
                
            },
            // citydata:citydata,
            progressdialogVisible:false,
            progressInfo:[]

        }
    },
    created () {
        this.getOrderList()
    },
    methods: {
       async getOrderList(){
          const {data:res}= await http.get('/orders',{params:this.queryInfo})
          this.total = res.data.total
          this.orderList = res.data.goods
        //   console.log(res);
       } ,
       handleSizeChange(newSize){
           this.queryInfo.pagesize=newSize,
           this.getOrderList()
       },
       handleCurrentChange(newNum){
           this.queryInfo.pagenum = newNum,
           this.getOrderList()
       },
       showBox(){
           this.addressdialogVisible=true

       },
    //    addressClose(){
    //        this.$refs.addressruleRorm.resetFields()
    //    },
       async showProgress(){
          const {data:res} =  await http.get('/kuaidi/803909574412544580')
          
          this.progressInfo = res.data
           this.progressdialogVisible=true
           console.log(res)
       }
    }

}

</script>
<style>
</style>