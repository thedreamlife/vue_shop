<template>
  <div>
      <!-- 面包屑导航 -->
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区 -->
    <el-card>
        <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 600px;height:400px;"></div>
    
    </el-card>

  </div>
</template>

<script>
import echarts from 'echarts'
import http from '../../http/http'
import _ from 'lodash'
export default {

    data () {
        return {
            options:{

            }
        }
    },
    // 此时页面上的元素渲染完毕
async mounted () {
         // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        const{data:res}=await http.get('reports/type/1')

        // 指定图表的配置项和数据
       const result =  _.merge(res.data,this.options)
         // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
    },

        

}

</script>
<style>
</style>