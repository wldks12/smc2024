import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler, // Filler 플러그인 가져오기
} from 'chart.js';

// 스케일 및 컨트롤러 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler // Filler 플러그인 등록
);

const Dashboard = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [lineChartData, setLineChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});

  useEffect(() => {
    // API 호출
    fetch(`${apiUrl}/api/dashboard`)
      .then((response) => response.json())
      .then((data) => {
        // 라인 차트 데이터를 변환합니다.
        const dates = data.map((item) => item[0]); // 날짜 배열
        const counts = data.map((item) => item[1]); // 카운트 배열

        // 라인 차트 데이터 설정
        setLineChartData({
          labels: dates,
          datasets: [
            {
              label: 'Post Count',
              data: counts,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true, // Filler 플러그인을 사용하기 위해 필요
            },
          ],
        });

        // 원 그래프 데이터를 설정합니다.
        setPieChartData({
          labels: dates, // 날짜를 레이블로 사용
          datasets: [
            {
              label: 'Post Count by Date',
              data: counts, // 카운트를 데이터로 사용
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => console.error('Error fetching dashboard data:', error));
  }, [apiUrl]);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ width: '400px', height: '300px' }}>
        {lineChartData && lineChartData.labels && <Line data={lineChartData} />}
      </div>
      <div style={{ width: '300px', height: '300px', marginTop: '20px' }}>
        {pieChartData && pieChartData.labels && <Pie data={pieChartData} />}
      </div>
    </div>
  );
};

export default Dashboard;
