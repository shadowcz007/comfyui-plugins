import React, { useState } from 'react';
import { Avatar, List, Radio, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";

import Item from './Item'


const App: any = (props: any) => {
  const { name, items, callback, actions } = props;
  const [data,setData]=React.useState(items);
  const [play, setPlay]: any = React.useState({});
  const [current,setCurrent]=React.useState(1);
  const _dragRef: any = React.useRef();
  const defaultPosition = JSON.parse(localStorage.getItem(`_workflow_plugin_position_${name}`) || JSON.stringify({
    x: 0, y: 0
  }))
  const savePosition = (e: any) => {
    // console.log(_dragRef.current.state)
    const { x, y } = _dragRef.current.state;
    localStorage.setItem(`_workflow_plugin_position_${name}`, JSON.stringify({
      x, y
    }))
  }

  console.log('data',current,data.slice(current*2-2,current*2))

  return (
    <Draggable
      ref={_dragRef}
      // 初始位置
      defaultPosition={defaultPosition || { x: 0, y: 0 }}

      handle="strong"
      onDrag={savePosition}
      onStop={savePosition}

    >
      <Card
        title={<strong className="cursor">{i18n.t(name)}</strong>}
        bordered={false}
        style={{
          width: 360,
          position: 'fixed',
          // height: '80vh' 
        }}
        extra={<CloseOutlined key="edit"
          onClick={async () => {
            if (callback) {
              // console.log(name)
              callback({
                cmd: 'display',
                data: { show: false }
              })
            }
          }}
        />}

        actions={actions}

      >

        <List
          pagination={{ 
            position: 'top', 
            align: 'start',
            current,
            pageSize:2,
            onChange:(e:any)=>{
              // setCurrent(e);
              setData(items.slice(e*2-2,e*2))
            } ,
            total:items.length,
            hideOnSinglePage:true
          }}
          dataSource={data}
          renderItem={(item: any, index) => {
          
            return <List.Item>
              <Item 
              data={item}
              callback={callback}
              />
            </List.Item>
          }}
        />
      </Card>
    </Draggable>
  );
};

export default App;