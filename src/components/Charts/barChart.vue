<template>
    <div id="myChart"></div>
</template>

<script>
    //导入echart
    import echarts from 'echarts/lib/echarts';
    // 引入柱状图
    import 'echarts/lib/chart/bar';
    // 引入提示框和标题组件
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/title';

    export default {
        name: "barChart",
        data () {
            return {

            }
        },
        mounted() {
            var myChart = echarts.init(document.getElementById('myChart'));
            // 绘制图表
            myChart.setOption({
                title: {
                    text: 'ECharts 入门示例'
                },
                tooltip: {},
                legend: {
                    data:['销量']
                },
                xAxis: {
                    data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
                },
                yAxis: {},
                series: [{
                    name: '销量',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }]
            });
        }
    }
</script>

<style scoped>

</style>