import { Button, Modal, message , Form, Input, DatePicker, TimePicker} from "antd";
import type { InputRef } from 'antd';
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState , useRef} from "react";
import dayjs from "dayjs";
const EditEventButton = (props: {
    id : number;
    title: String;
    description: String;
    location: String;
    date: String;
    time: String;
  }) => {


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [, setIsPending] = useState<boolean>(false); //not used yet
    const [err, setErr] = useState<any>(null); //error message from server
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const [form] = Form.useForm();
    //the event details
    // const [title, setTitle] = useState(props.title.toString())
    // const [description, setDescription] = useState(props.description.toString())
    // const [location, setLocation] = useState(props.location.toString())



    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        setIsModalOpen(false);
        form.submit();
        //call backend to delete
          
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const onFinish = async (fieldsValue: any) => {
        // Should format date value before submit.
        const values = {
          ...fieldsValue,
          'date': fieldsValue['date'].format('YYYY/MM/DD'),
          'time': fieldsValue['time'].format('h:mm a').replace(/\s/g, ""),
        };
        const capitalCaseValues = Object.keys(values).reduce((acc, key) => {
          const capitalCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
          acc[capitalCaseKey] = values[key];
          return acc;
      }, {} as Record<string, any>);
       const jsonString = JSON.stringify(capitalCaseValues);
        console.log('Received values of form: ', capitalCaseValues);
        try {
          const response = await fetch(import.meta.env.VITE_API_KEY + "/events/" 
              + props.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: jsonString,
            credentials: "include",
          });
          if (!response.ok) {
            const respjson = await response.json();
            throw respjson.error;
          } else {
            setIsPending(false);
            //show notif that it is deleted
            messageApi.success('Successfully updated event.');
            //navigate back to dashboard
            navigate("/dashboard");
          }
        } catch (error: any) {
          setIsPending(false);
          setErr(error);
          console.error(error);
          if (error instanceof SyntaxError) {
            setIsPending(false);
            messageApi.success('Successfully updated event.');
            navigate("/dashboard");
          } else {
            messageApi.error('Could not update event.');
          }
          
          //show notif that theres an error
        }
    };  
  
    const onFinishFailed = (errorInfo : any) => {
      console.log("Failed:", errorInfo);
    };   


    //form stuff
    type FieldType = {
        title?: string;
        description?: string;
        location?: string;
      };
  
    return (
        <>
        {contextHolder}
            <Button
        style={{ margin: '7px' }}
        type="primary"
        icon={<EditOutlined />}
        size="middle"
        iconPosition="start"
        onClick={showModal}
      >

      </Button>
      <Modal cancelButtonProps={{type : "text", color : "ffffff"}} 
          title="Update your event" 
          okText = "Save"
          open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Form
      form={form}
      initialValues={{
        'title': props.title.toString(),
        'description': props.description.toString(),
        'location': props.location.toString(),
        'date': dayjs(props.date.toString(), 'D/M/YYYY'),
        'time' : dayjs(props.time.toString(), 'h:mm:ss A')
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
          {/*Title*/}
          <Form.Item<FieldType>
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Input your title' }]}
        >
            <Input placeholder="Input your title"/>
          </Form.Item>
          {/*Description*/}
          <Form.Item<FieldType>
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Input your description' }]}
        >
            <Input placeholder="Input your description"/>
          </Form.Item>

          {/*Date*/}
          <Form.Item label="Date" name = "date">
            <DatePicker />
          </Form.Item>

          {/*Time*/}
          <Form.Item label="Time" name = "time">
            <TimePicker use12Hours={true}/>
          </Form.Item>

          {/*Location*/}
          <Form.Item<FieldType>
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Input your location' }]}
        >
            <Input placeholder="Input your location" />
          </Form.Item>
      </Form>
      </Modal>
        </>
      
    );
  };
  
export default EditEventButton;