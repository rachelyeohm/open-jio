import { Menu, Typography } from "antd";
import Appbar from "../components/Appbar";
import type { MenuProps } from 'antd';
import {useState} from 'react';
import {FundOutlined, HeartOutlined, ScheduleOutlined, UserAddOutlined } from "@ant-design/icons";

type MenuItem = Required<MenuProps>['items'][number];

  const items: MenuItem[] = [
    {
      label: 'Recommended Events',
      key: 'rec',
      icon: <FundOutlined />,
    },
    {
      label: 'Liked Events',
      key: 'liked',
      icon: <HeartOutlined />,
    },
    {
      label: 'Joined Events',
      key: 'joined',
      icon: <ScheduleOutlined />,
    },
    {
      label: 'Created Events',
      key: 'created',
      icon: <UserAddOutlined />,
    }
]

const Recommended = () => {
  return <div style = {{margin : 10}}>
    Work in progress! Check out the other tabs instead.
  </div>
}

const Dashboard = () => {

  const [current, setCurrent] = useState('rec');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };
  

  
  return (
    <>
      <Appbar />
      <div
        style={{
          margin: 10
        }}
      >
        <Typography>
          <h1>User Dashboard</h1>
        </Typography>
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
        {
          current == "rec" ? <Recommended/> : <p>nil</p>
        }
      </div>
    </>
  );
};
export default Dashboard;
