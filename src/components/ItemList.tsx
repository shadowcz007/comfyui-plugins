import React, { useState } from 'react';
import { Avatar, List, Radio, Progress, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";

import Item from './Item';
import { savePosition, getPosition, onCardFocus } from './Common'

const App: any = (props: any) => {
  const { name, items, callback, actions, pageSize } = props;
  const [_items, setItems] = React.useState(items);
  const [data, setData] = React.useState(items.slice(0, pageSize));

  const [current, setCurrent] = React.useState(1);

  const _dragRef: any = React.useRef();

  const key = (name === 'History') ? `_history_position` : `_workflow_plugin_position`;

  const defaultPosition = getPosition(key);

  const _savePosition = (e: any) => {
    savePosition(key, e);
  };

  const [serverStatus, setServerStatus] = React.useState(0);
  const [progress, setProgress] = React.useState(101);

  const _pageSize = pageSize || 2;

  React.useEffect(() => {
    console.log('items', items)
    setItems(items);
    setData(items.slice(_pageSize * (current - 1), _pageSize * current));

    onCardFocus(key)

    if (name == 'Workflow_Plugins') {
      window.addEventListener('message', (res: any) => {
        const { event, data } = res.data?.data;

        if (event === 'execution_start') {
          // prompt_id
          let prompt_id = data.prompt_id;
          console.log('#execution_start', prompt_id)
        }

        if (event === 'status') {
          // 是否连接了服务器
          if (data) {
            // 正常
            setServerStatus(0)
          } else {
            // 服务不可用
            setServerStatus(1)
          }
        }

        if (event === 'progress') {
          const { value, max } = data;
          setProgress(100 * value / max)
        }


      })
    }


  }, [current, items])


  return (
    <Draggable
      ref={_dragRef}
      // 初始位置
      defaultPosition={defaultPosition || { x: 0, y: 0 }}

      handle="strong"
      onDrag={_savePosition}
      onStop={_savePosition}
      defaultClassName={`react-draggable ${key}`}
      onMouseDown={() => onCardFocus(key)}
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
        {progress <= 100 && <Progress steps={5} percent={progress} />}
        <List
          pagination={{
            position: 'top',
            align: 'start',
            // current,
            pageSize: _pageSize,
            onChange: (page: any) => {
              setCurrent(page);
              setData(items.slice(_pageSize * (page - 1), _pageSize * page))
            },
            total: items.length,
            hideOnSinglePage: true
          }}
          dataSource={data}
          renderItem={(item: any, index) => {
            return <List.Item key={index}>
              <Item
                isHistory={name === 'History'}
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