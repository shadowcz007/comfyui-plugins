import { AppstoreAddOutlined,WifiOutlined,FileSearchOutlined,SettingOutlined   } from '@ant-design/icons';
import React from 'react';
import { FloatButton } from 'antd';


type PropType = {
    [propName: string]: any;
}

type StateType = {
    [stateName: string]: any;
}

interface App {
    state: StateType;
    props: PropType
}

class App extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            
        }
         
    }

    componentDidMount() {
       
    }

    componentDidUpdate(prevProps: any, prevState: any) {
    
    }

    componentWillUnmount() {
       
    }

    render() {
      const {
        openPlugin,
        openSetup,
        getHistory,
        serverStatus
    }=this.props;
        return (
          <>
          <FloatButton.Group
            trigger="hover"
            type="primary"
            style={{ right: 94 }}
            icon={<WifiOutlined />}
            badge={{ dot: serverStatus>0 }}
          >
            <FloatButton icon={<AppstoreAddOutlined />}
            onClick={openPlugin}
            
            />
            
            <FloatButton icon={<FileSearchOutlined />} 
            onClick={getHistory}
            />
      
      <FloatButton icon={<SettingOutlined />} 
            onClick={openSetup}
            badge={{ dot: serverStatus>0 }}
            />
          
          </FloatButton.Group>
        </>
        );
    }
}

export default App;