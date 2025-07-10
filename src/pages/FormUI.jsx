import React, { useState, useEffect, useCallback } from 'react';
import { Form, Select, Input, Spin, Typography, message } from 'antd';
import 'antd/dist/reset.css';

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

const API_BASE_URL = 'http://202.157.176.100:3001';

const FormUI = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [selectedNegara, setSelectedNegara] = useState(null);
    const [selectedPelabuhan, setSelectedPelabuhan] = useState(null);
    const [selectedBarang, setSelectedBarang] = useState(null);
    const [discount, setDiscount] = useState('');
    const [harga, setHarga] = useState('');
    const [total, setTotal] = useState('');

    const [negaraOptions, setNegaraOptions] = useState([]);
    const [pelabuhanOptions, setPelabuhanOptions] = useState([]);
    const [barangOptions, setBarangOptions] = useState([]);

    const [isLoadingNegara, setIsLoadingNegara] = useState(false);
    const [isLoadingPelabuhan, setIsLoadingPelabuhan] = useState(false);
    const [isLoadingBarang, setIsLoadingBarang] = useState(false);

    const errorApi = useCallback(() => {
        messageApi.open({
            type: 'error',
            content: 'Error fetching data',
        });
    }, [messageApi]);

    const formatRupiah = useCallback((amount) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return '';
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numericAmount);
    }, []);

    useEffect(() => {
        const fetchNegaras = async () => {
            setIsLoadingNegara(true);
            try {
                const response = await fetch(`${API_BASE_URL}/negaras`);
                const data = await response.json();
                setNegaraOptions(data);
                const defaultNegara = data.find(n => n.kode_negara === 'ID') || null;
                form.setFieldsValue({ negara: defaultNegara.id_negara });
            } catch (error) {
                errorApi()
            } finally {
                setIsLoadingNegara(false);
            }
        };
        fetchNegaras();
    }, [form, errorApi]);

    useEffect(() => {
        const fetchPelabuhans = async () => {
            if (!selectedNegara) {
                setPelabuhanOptions([]);
                setSelectedPelabuhan(null);
                setSelectedBarang(null);
                form.setFieldsValue({ pelabuhan: undefined, barang: undefined });
                return;
            }
            setIsLoadingPelabuhan(true);
            try {
                const filter = encodeURIComponent(JSON.stringify({ where: { id_negara: selectedNegara.id_negara } }));
                const response = await fetch(`${API_BASE_URL}/pelabuhans?filter=${filter}`);
                const data = await response.json();
                setPelabuhanOptions(data);
            } catch (error) {
                errorApi()
            } finally {
                setIsLoadingPelabuhan(false);
            }
        };

        fetchPelabuhans();
    }, [selectedNegara, form, errorApi]);

    useEffect(() => {
        const fetchBarangs = async () => {
            if (!selectedPelabuhan) {
                setBarangOptions([]);
                setSelectedBarang(null);
                form.setFieldsValue({ barang: undefined });
                return;
            }

            setIsLoadingBarang(true);
            try {
                const filter = encodeURIComponent(JSON.stringify({ where: { id_pelabuhan: selectedPelabuhan.id_pelabuhan } }));
                const response = await fetch(`${API_BASE_URL}/barangs?filter=${filter}`);
                const data = await response.json();
                setBarangOptions(data);
            } catch (error) {
                errorApi()
            } finally {
                setIsLoadingBarang(false);
            }
        };
        fetchBarangs();
    }, [selectedPelabuhan, form, errorApi]);

    useEffect(() => {
        if (selectedBarang) {
            const newDiscount = selectedBarang.diskon ? String(selectedBarang.diskon) : '';
            const newHarga = selectedBarang.harga ? String(selectedBarang.harga) : '';
            const newDescription = selectedBarang.description || '';

            setDiscount(newDiscount);
            setHarga(newHarga);
            form.setFieldsValue({
                discount: newDiscount,
                harga: newHarga,
                description: newDescription,
            });
        } else {
            setDiscount('');
            setHarga('');
            form.setFieldsValue({ discount: '', harga: '', description: '' });
        }
    }, [selectedBarang, form]);

    useEffect(() => {
        const numericHarga = parseFloat(harga.replace(/[^0-9,]+/g, "").replace(",", ".")) || 0;
        const numericDiscount = parseFloat(discount) || 0;

        if (numericHarga > 0) {
            const calculatedTotal = numericHarga * (1 - numericDiscount / 100);
            const formattedTotal = formatRupiah(calculatedTotal);
            setTotal(formattedTotal);
            form.setFieldsValue({ total: formattedTotal });
        } else {
            setTotal('');
            form.setFieldsValue({ total: '' });
        }
    }, [harga, discount, form, formatRupiah]);



    const handleNegaraChange = (value) => {
        const selected = negaraOptions.find((n) => n.id_negara === value);
        setSelectedNegara(selected);
        setSelectedPelabuhan(null);
        setSelectedBarang(null);
        form.resetFields(['pelabuhan', 'barang', 'discount', 'harga', 'total']);
    };

    const handlePelabuhanChange = (value) => {
        const selected = pelabuhanOptions.find((p) => p.id_pelabuhan === value);
        setSelectedPelabuhan(selected);
        setSelectedBarang(null);
        form.resetFields(['barang', 'discount', 'harga', 'total']);
    };

    const handleBarangChange = (value) => {
        const selected = barangOptions.find((b) => b.id_barang === value);
        setSelectedBarang(selected);
        form.setFieldsValue({ description: selected.description })
    };

    const handleDiscountChange = (e) => {
        setDiscount(e.target.value);
    };

    const handleHargaChange = (e) => {
        setHarga(e.target.value);
    };

    return (
        <>
            {contextHolder}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '600px' }}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>TEST FRONTEND DEVELOPER</Title>

                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Form.Item
                            label="NEGARA"
                            name="negara"
                            rules={[{ required: true, message: 'Please select a country!' }]}
                        >
                            <Spin spinning={isLoadingNegara}>
                                <Select
                                    placeholder="Pilih Negara"
                                    onChange={handleNegaraChange}
                                    disabled={isLoadingNegara || negaraOptions.length === 0}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {negaraOptions.map(({ id_negara, kode_negara, nama_negara }) => (
                                        <Option key={id_negara} value={id_negara}>
                                            {kode_negara} - {nama_negara}
                                        </Option>
                                    ))}
                                </Select>
                            </Spin>
                        </Form.Item>
                        <Form.Item
                            label="PELABUHAN"
                            name="pelabuhan"
                            rules={[{ required: true, message: 'Please select a port!' }]}
                        >
                            <Spin spinning={isLoadingPelabuhan}>
                                <Select
                                    placeholder="Pilih Pelabuhan"
                                    onChange={handlePelabuhanChange}
                                    disabled={!selectedNegara || pelabuhanOptions.length === 0 || isLoadingPelabuhan}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {pelabuhanOptions.map((data) => (
                                        <Option key={data.id_pelabuhan} value={data.id_pelabuhan}>
                                            {data.nama_pelabuhan}
                                        </Option>
                                    ))}
                                </Select>
                            </Spin>
                        </Form.Item>
                        <Form.Item
                            label="BARANG"
                            name="barang"
                            rules={[{ required: true, message: 'Please select an item!' }]}
                        >
                            <Spin spinning={isLoadingBarang}>
                                <Select
                                    placeholder="Pilih Barang"
                                    onChange={handleBarangChange}
                                    disabled={!selectedPelabuhan || barangOptions.length === 0 || isLoadingBarang}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {barangOptions.map((data) => (
                                        <Option key={data.id_barang} value={data.id_barang}>
                                            {data.nama_barang}
                                        </Option>
                                    ))}
                                </Select>
                            </Spin>
                        </Form.Item>
                        {selectedBarang && (
                            <Form.Item name="description">
                                <TextArea
                                    disabled={true}
                                    style={{ marginTop: '10px' }}
                                />
                            </Form.Item>
                        )}
                        <Form.Item
                            label="DISCOUNT"
                            name="discount"
                        >
                            <Input
                                value={discount}
                                onChange={handleDiscountChange}
                                suffix="%"
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                            />
                        </Form.Item>
                        <Form.Item
                            label="HARGA"
                            name="harga"
                        >
                            <Input
                                value={harga}
                                onChange={handleHargaChange}
                                prefix="Rp."
                                type="number"
                                min={0}
                            />
                        </Form.Item>

                        <Form.Item
                            label="TOTAL"
                            name="total"
                        >
                            <Input
                                value={total}
                                readOnly
                                style={{ fontWeight: 'bold' }}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default FormUI;
