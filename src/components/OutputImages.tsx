import React, { useState } from 'react';
import { Avatar, List, Image, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";



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

      const {name,data}=this.props.images;

      this.state = { 
        name,
        images:data
      }

     
    }
  
    componentDidMount() {
      // this.setupConnection();
    }
  
    componentDidUpdate(prevProps: any, prevState: any) {
   
    }
  
    componentWillUnmount() {
      
    }
  
    render() {
      const {images,name}=this.state;
    
      return (
        <Draggable handle="strong" >
           <Card
              title={<strong className="cursor">{name}</strong>}
              bordered={false}
              style={ {
                width: 480,
                position: 'fixed',
                // left: 120, top: '10vh', 
                // height: '80vh' 
              } }
              bodyStyle={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              extra={<CloseOutlined key="edit"
                onClick={async () => {
                  window.postMessage({
                    data: {
                        event:'close-output',
                        data:{
                          name,
                          type:'images',
                        }
                    }
                })
                }}
              />}
              // actions={actions}
            >
                <Image.PreviewGroup
                    preview={{
                        onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                    }}
                >
                    {
                        Array.from(images, (imgurl: string,index:number) => 
                        <Image 
                        key={index}
                        style={{
                          display:index>3?'none':'block'
                        }}
                        width={200} 
                        src={imgurl} />)
                    }

                </Image.PreviewGroup>
              {/* <Image width={200} src={imgurl} /> */}
            </Card>
       
        </Draggable>
      );
    }
  }
  
  export default App