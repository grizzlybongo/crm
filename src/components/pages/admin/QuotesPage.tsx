import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Dropdown, 
  Modal, 
  Form, 
  Typography,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  SendOutlined,
  DownloadOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { Quote, addQuote, updateQuote, deleteQuote } from '../../../store/slices/quotesSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const QuotesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { quotes } = useSelector((state: RootState) => state.quotes);
  const { clients } = useSelector((state: RootState) => state.clients);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form] = Form.useForm();

  const filteredQuotes = quotes.filter(quote =>
    quote.number.toLowerCase().includes(searchText.toLowerCase()) ||
    quote.clientName.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      sent: 'blue',
      accepted: 'green',
      rejected: 'red',
      expired: 'orange',
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Rejeté',
      expired: 'Expiré',
    };
    return texts[status as keyof typeof texts];
  };

  const columns = [
    {
      title: 'Numéro',
      dataIndex: 'number',
      key: 'number',
      render: (number: string) => (
        <Space>
          <FileOutlined style={{ color: '#1890ff' }} />
          <Text strong>{number}</Text>
        </Space>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Valide jusqu\'au',
      dataIndex: 'validUntil',
      key: 'validUntil',
    },
    {
      title: 'Montant',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} €
        </Text>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Quote) => (
        <Dropdown
          overlay={
            <Space direction="vertical" size="small">
              <Button type="text" icon={<EyeOutlined />}>
                Voir
              </Button>
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingQuote(record);
                  setModalVisible(true);
                  form.setFieldsValue({
                    ...record,
                    date: dayjs(record.date),
                    validUntil: dayjs(record.validUntil),
                  });
                }}
              >
                Modifier
              </Button>
              <Button type="text" icon={<SendOutlined />}>
                Envoyer
              </Button>
              <Button type="text" icon={<CheckOutlined />}>
                Convertir en facture
              </Button>
              <Button type="text" icon={<DownloadOutlined />}>
                Télécharger
              </Button>
              <Divider style={{ margin: '4px 0' }} />
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Supprimer le devis',
                    content: 'Êtes-vous sûr de vouloir supprimer ce devis ?',
                    onOk: () => dispatch(deleteQuote(record.id)),
                  });
                }}
              >
                Supprimer
              </Button>
            </Space>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    const items = values.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.2;
    const total = subtotal + tax;

    const quoteData = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      validUntil: values.validUntil.format('YYYY-MM-DD'),
      clientName: clients.find(c => c.id === values.clientId)?.name || '',
      items,
      subtotal,
      tax,
      total,
    };

    if (editingQuote) {
      dispatch(updateQuote({ ...editingQuote, ...quoteData }));
      message.success('Devis mis à jour');
    } else {
      const newQuote: Quote = {
        ...quoteData,
        id: Date.now().toString(),
        number: `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
        status: 'draft',
      };
      dispatch(addQuote(newQuote));
      message.success('Devis créé');
    }
    setModalVisible(false);
    setEditingQuote(null);
    form.resetFields();
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Gestion des devis</Title>
        <Text type="secondary">Créez et gérez vos devis</Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Rechercher un devis..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingQuote(null);
              setModalVisible(true);
              form.resetFields();
            }}
          >
            Nouveau devis
          </Button>
        </Space>

        <Table
          dataSource={filteredQuotes}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} devis`,
          }}
        />
      </Card>

      {/* Modal de création/édition */}
      <Modal
        title={editingQuote ? 'Modifier le devis' : 'Nouveau devis'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingQuote(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: dayjs(),
            validUntil: dayjs().add(30, 'day'),
            items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clientId"
                label="Client"
                rules={[{ required: true, message: 'Le client est requis' }]}
              >
                <Select placeholder="Sélectionner un client">
                  {clients.map(client => (
                    <Option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'La date est requise' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="validUntil"
                label="Valide jusqu'au"
                rules={[{ required: true, message: 'La date de validité est requise' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Lignes du devis</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Description requise' }]}
                      >
                        <Input placeholder="Description" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Quantité requise' }]}
                      >
                        <InputNumber placeholder="Qté" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'unitPrice']}
                        rules={[{ required: true, message: 'Prix unitaire requis' }]}
                      >
                        <InputNumber 
                          placeholder="Prix unitaire" 
                          min={0} 
                          style={{ width: '100%' }}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item dependencies={[name]}>
                        {() => {
                          const items = form.getFieldValue('items') || [];
                          const item = items[name];
                          const total = (item?.quantity || 0) * (item?.unitPrice || 0);
                          return (
                            <Input 
                              value={`${total.toLocaleString()} €`} 
                              disabled 
                              style={{ textAlign: 'right' }}
                            />
                          );
                        }}
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(name)}
                      >
                        ×
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Ajouter une ligne
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Notes ou conditions particulières" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuotesPage;