<template>
    <div id="myPieChart"></div>
</template>

<script>
    //导入echart
    import echarts from 'echarts/lib/echarts';
    // 引入柱状图
    import 'echarts/lib/chart/pie';
    // 引入提示框和标题组件
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/title';
    import 'echarts/lib/component/legend';

    export default {
        name: "pieChart",
        data () {
            return {

            }
        },
        props: ['chartData','chartName'],
        created () {

        },
        mounted () {
           // this.pieChart();
        },
        watch: {
            chartData: {
                handler: function () {
                    this.pieChart();
                }
            }
        },
        methods: {
            pieChart () {
                const myChart = echarts.init(document.getElementById('myPieChart'), null,{ width:500});
                // 绘制图表
                myChart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{b}: {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data:this.chartName
                    },
                    series: [
                        {
                            name:'访问来源',
                            type:'pie',
                            radius: ['50%', '70%'],
                            avoidLabelOverlap: false,
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '20',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data: this.chartData
                        }
                    ]
                });
            }
        }
    }
</script>

<style scoped>

</style>