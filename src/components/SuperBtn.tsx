import { AppstoreAddOutlined,WifiOutlined,FileSearchOutlined,SettingOutlined   } from '@ant-design/icons';
import React from 'react';
import { FloatButton } from 'antd';

const App: React.FC = (props:any) =>{
    const {
        openPlugin,
        openSetup,
        getHistory,
        badge
    }=props
    return <>
    <FloatButton.Group
      trigger="hover"
      type="primary"
      style={{ right: 94 }}
      icon={<WifiOutlined />}
      badge={{count: badge }}
    >
      <FloatButton icon={<AppstoreAddOutlined />}
      onClick={openPlugin}
      
      />
      
      <FloatButton icon={<FileSearchOutlined />} 
      onClick={getHistory}
      />

<FloatButton icon={<SettingOutlined />} 
      onClick={openSetup}/>
    
    </FloatButton.Group>
  </>
};

export default App;