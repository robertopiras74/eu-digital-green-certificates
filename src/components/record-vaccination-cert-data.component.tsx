/*
 * eu-digital-green-certificates/ dgca-issuance-web
 *
 * (C) 2021, T-Systems International GmbH
 *
 * Deutsche Telekom AG and all other contributors /
 * copyright owners license this file to you under the Apache
 * License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { MouseEventHandler } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

import '../i18n';
import { useTranslation } from 'react-i18next';

import sha256 from 'crypto-js/sha256';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';
import utils from '../misc/utils';
import { IdentifierType, Sex } from '../misc/enum'
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import de from 'date-fns/locale/de';
import { EUDGC, VaccinationEntry, DiseaseAgentTargeted } from '../generated-files/dgc-schema-object';
import { useGetVaccinMedicalData } from '../api';

// import { useGetUuid } from '../api';
const iso3311a2 = require('iso-3166-1-alpha-2');
const schema = require('../generated-files/DGC-all-schemas-combined.json');
const Validator = require('jsonschema').Validator;
const validator = new Validator();

registerLocale('de', de)

enum DESEASES {
    // diseases
    _840539006 = "840539006"
}

const RecordVaccinationCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();
    const vacMedData = useGetVaccinMedicalData();

    const [isInit, setIsInit] = React.useState(false)
    // const [uuIdHash, setUuIdHash] = React.useState('');
    // const [processId, setProcessId] = React.useState('');

    const [firstName, setFirstName] = React.useState('');
    const [name, setName] = React.useState('');
    const [identifierType, setIdentifierType] = React.useState('');
    const [identifierNumber, setIdentifierNumber] = React.useState('');
    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();
    const [sex, setSex] = React.useState<Sex>(Sex.MALE);
    const [disease, setDisease] = React.useState('');
    const [vaccine, setVaccine] = React.useState<any>('');
    const [medicalProduct, setMedicalProduct] = React.useState<any>('');
    const [marketingHolder, setMarketingHolder] = React.useState<any>('');
    const [sequence, setSequence] = React.useState<number>();
    const [tot, setTot] = React.useState<number>();
    const [vacLastDate, setVacLastDate] = React.useState<Date>();
    const [lot, setLot] = React.useState('');
    const [adm, setAdm] = React.useState('');
    const [selectedIdentifierTypeOptionValue, setSelectedIdentifierTypeOptionValue] = React.useState<string>();
    const [personCountry, setPersonCountry] = React.useState<string>();
    const [issuerCountry, setIssuerCountry] = React.useState<string>();

    const [identifierTypeOptions, setIdentifierTypeOptions] = React.useState<HTMLSelectElement[]>();
    const [isoCountryOptions, setIsoCountryOptions] = React.useState<HTMLSelectElement[]>();

    //TODO: Options to be read from the gateway
    const [diseasOptions, setDiseasOptions] = React.useState<HTMLSelectElement[]>();
    const [vaccineOptions, setVaccineOptions] = React.useState<HTMLSelectElement[]>();
    const [medicalProductOptions, setMedicalProductOptions] = React.useState<HTMLSelectElement[]>();
    const [marketingHolderOptions, setMarketingHolderOptions] = React.useState<HTMLSelectElement[]>();

    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);

    React.useEffect(() => {
        setOptions();
        setIso3311a2();
        initDynamicOptions();

        setIdentifierType(IdentifierType.PPN);
        setSelectedIdentifierTypeOptionValue(IdentifierType.PPN);
    }, []);

    React.useEffect(()=> {
        if (vacMedData){
            // set combo options
        }
    }, [vacMedData])

    const handleError = (error: any) => {
        let msg = '';

        if (error) {
            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

    const handleDateOfBirthChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setDateOfBirth(date);
    }

    const handleVacLastDate = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setVacLastDate(date);
    }

    const handleDateChange = (evt: Date | [Date, Date] | null) => {
        let date: Date;

        if (Array.isArray(evt))
            date = evt[0];
        else
            date = evt as Date;

        if (date) {
            date.setHours(12);
        }

        return date;
    }

    const handleCancel = () => {
        props.setEudgc(undefined);
        navigation?.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;

        // data for the backend
        alert(
            firstName + " " +
            name + " " +
            dateOfBirth?.toDateString() + " " +
            sex + " " +
            selectedIdentifierTypeOptionValue + " " +
            personCountry?.substr(0, 2) + " " +
            identifierNumber + " " +
            disease + " " +
            vaccine + " " +
            medicalProduct + " " +
            marketingHolder + " " +
            sequence + " " +
            tot + " " +
            vacLastDate?.toDateString() + " " +
            issuerCountry?.substr(0, 2) + " " +
            lot + " " +
            adm);

        const vacc: VaccinationEntry = {
            // tg: disease,
            //TODO:

            tg: disease as DiseaseAgentTargeted,
            vp: vaccine,
            mp: medicalProduct,
            ma: marketingHolder,
            dn: sequence!,
            sd: tot!,
            dt: formatDate(vacLastDate!),
            co: issuerCountry!.substr(0, 2),
            // TODO: was bedeutet das?
            is: adm,
            /**
             * Unique Certificate Identifier: UVCI
             * TODO: Wo kommt das her?
             */
            ci: "Wo kommt das her?"
        };

        const eudgc: EUDGC = {
            //TODO: Welche Version
            ver: '0.1.0',
            nam: {
                fnt: name,
                gnt: firstName
            },
            dob: formatDate(dateOfBirth!),
            v: [vacc]
        }

        var result = validator.validate(eudgc, schema);
        if (!result.valid) {
            console.error(result);
            alert("Eingabe passt nicht zum Schema. Siehe Konsoleausgabe!");
        }

        console.log(vacc);

        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
            props.setEudgc(eudgc);
            setTimeout(navigation!.toShowCert, 200);
        }
    }

    const formatDate = (date: Date): string => {
        return `${date.toISOString().substr(0, 10)}`;
    }

    const setOptions = () => {
        const options: any[] = [];
        for (let option in IdentifierType) {
            options.push(<option key={option} value={option}>{t('translation:' + option)}</option>)
        }

        setIdentifierTypeOptions(options);
    }

    //TODO: These options will be read dynamically from the gateway
    const initDynamicOptions = () => {
        const tmpDeseasOptions: string[] = ['840539006'];
        setDiseasOptions(setDynamicOptions(tmpDeseasOptions));
        setDisease(tmpDeseasOptions[0]);

        const tmpVaccineOptions: string[] = ['1119305005', '1119349007', 'J07BX03'];
        setVaccineOptions(setDynamicOptions(tmpVaccineOptions));
        setVaccine(tmpVaccineOptions[0]);

        const tmpMedicalOptions: string[] = ['EU/1/20/1528', 'EU/1/20/1507', 'EU/1/21/1529', 'EU/1/20/1525', 'CVnCoV', 'NVX-CoV2373',
            'Sputnik-V', 'Convidecia', 'EpiVacCorona', 'BBIBP-CorV', 'Inactivated-SARS-CoV-2-Vero-Cell',
            'CoronaVac', 'Covaxin'];
        setMedicalProductOptions(setDynamicOptions(tmpMedicalOptions));
        setMedicalProduct(tmpMedicalOptions[0]);

        const tmpMarketingHolderOptions: string[] = ['ORG-100001699', 'ORG-100030215', 'ORG-100001417', 'ORG-100031184', 'ORG-100006270',
            'ORG-100013793', 'ORG-100020693', 'ORG-100020693', 'ORG-100010771', 'ORG-100024420', 'ORG-100032020',
            'Gamaleya-Research-Institute', 'Vector-Institute', 'Sinovac-Biotech', 'Bharat-Biotech'];
        setMarketingHolderOptions(setDynamicOptions(tmpMarketingHolderOptions));
        setMarketingHolder(tmpMarketingHolderOptions[0]);
    }

    const setDynamicOptions = (dynamicOptions: string[]) => {
        const options: any[] = [];
        for (let i = 0; i < dynamicOptions.length; i++) {
            options.push(<option key={i} value={dynamicOptions[i]}>{dynamicOptions[i]}</option>)
        }

        return options;
    }

    const setIso3311a2 = () => {
        const options: any[] = [];
        const codes: any[] = iso3311a2.getCodes().sort();
        for (let i = 0; i < codes.length; i++) {
            options.push(<option key={codes[i]}>{codes[i] + " : " + iso3311a2.getCountry(codes[i])}</option>)
        }

        setIsoCountryOptions(options);
        setPersonCountry(codes[0]);
        setIssuerCountry(codes[0]);
    }

    const handleIdentifierTypeChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setIdentifierType(event.target.value);
        setSelectedIdentifierTypeOptionValue(event.target.value);
    }

    return (
        !isInit ? <Spinner /> :
            <>
                {/* <Row id='process-row'>
                    <span className='font-weight-bold mr-2'>{t('translation:process')}</span>
                    <span>{processId}</span>
                </Row> */}
                <Card id='data-card'>

                    <Form onSubmit={handleSubmit} /*validated={validated}*/>

                        {/*
                            header with title and id card query
                        */}
                        <Card.Header id='data-header' className='pb-0'>
                            <Row>

                                <Col md='4' className='d-flex justify-content-left'>
                                    <Card.Text id='id-query-text'>{t('translation:query-id-card')}</Card.Text>
                                </Col>
                                <Col md='8'>
                                    <Card.Title className='m-md-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:vaccination-cert')}</Card.Title>
                                </Col>
                            </Row>
                            <hr />
                        </Card.Header>

                        {/*
                            content area with patient inputs and check box
                        */}
                        <Card.Body id='data-body' className='pt-0'>

                            {/* first name input */}
                            <Form.Group as={Row} controlId='formFirstNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:first-name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={firstName}
                                        onChange={event => setFirstName(event.target.value.toUpperCase())}
                                        placeholder={t('translation:first-name')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            {/* name input */}
                            <Form.Group as={Row} controlId='formNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={name}
                                        onChange={event => setName(event.target.value.toUpperCase())}
                                        placeholder={t('translation:name')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            {/* date of birth input */}
                            <Form.Group as={Row} controlId='formDateOfBirthInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:date-of-birth') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={dateOfBirth}
                                        onChange={handleDateOfBirthChange}
                                        locale='de'
                                        dateFormat='dd. MM. yyyy'
                                        isClearable
                                        placeholderText={t('translation:date-of-birth')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={new Date()}
                                        minDate={new Date(1900, 0, 1, 12)}
                                        openToDate={new Date(1990, 0, 1)}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            {/* sex input */}
                            <Row className='mb-1 sb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3' lg='3'>{t('translation:sex') + '*'}</Form.Label>

                                <Col xs='7' sm='9' lg='9' className='d-flex'>
                                    <Row>
                                        <Form.Group as={Col} xs='12' sm='6' md='3' className='d-flex mb-0' controlId='sex-radio1'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio1"
                                                    checked={sex === Sex.MALE}
                                                    onChange={() => setSex(Sex.MALE)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:male')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                        <Form.Group as={Col} xs='12' sm='6' md='3' className='d-flex mb-0' controlId='sex-radio2'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input required
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio2"
                                                    checked={sex === Sex.FEMALE}
                                                    onChange={() => setSex(Sex.FEMALE)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:female')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                        <Form.Group as={Col} xs='12' sm='6' md='3' className='d-flex mb-0' controlId='sex-radio3'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio3"
                                                    checked={sex === Sex.OTHER}
                                                    onChange={() => setSex(Sex.OTHER)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:other')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                        <Form.Group as={Col} xs='12' sm='6' md='3' className='d-flex mb-0' controlId='sex-radio4'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio4"
                                                    checked={sex === Sex.UNKNOWN}
                                                    onChange={() => setSex(Sex.UNKNOWN)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:unknown')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                    </Row>
                                </Col>
                            </Row>
                            <hr />
                            {/* Combobox for Identifier Type */}
                            <Form.Group as={Row} controlId='formIdentifyerTypeInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:identifierType') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={identifierType}
                                        onChange={handleIdentifierTypeChanged}
                                        placeholder={t('translation:name')}
                                        required
                                    >
                                        {identifierTypeOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* Combobox for the countries in iso-3166-1-alpha-2 */}
                            <Form.Group as={Row} controlId='formIsoCountryInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:country') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={personCountry}
                                        onChange={event => setPersonCountry(event.target.value)}
                                        placeholder={t('translation:country')}
                                        required
                                    >
                                        {isoCountryOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* input identifierNumber */}
                            <Form.Group as={Row} controlId='formIdentifyerNumberInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:identifierNumber') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={identifierNumber}
                                        onChange={event => setIdentifierNumber(event.target.value)}
                                        placeholder={t('translation:identifierNumber')}
                                        type='text'
                                        required
                                        maxLength={79}
                                    />
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* combobox disease */}
                            <Form.Group as={Row} controlId='formDiseaseInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:disease-agent') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={disease}
                                        onChange={event => setDisease(event.target.value)}
                                        placeholder={t('translation:def-disease-agent')}
                                        required
                                    >
                                        {diseasOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* combobox vaccine */}
                            <Form.Group as={Row} controlId='formVaccineInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vaccine') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={vaccine}
                                        onChange={event => setVaccine(event.target.value)}
                                        placeholder={t('translation:vaccine')}
                                        required
                                    >
                                        {vaccineOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* combobox medicalProduct */}
                            <Form.Group as={Row} controlId='formMedicalProductInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-medical-product') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={medicalProduct}
                                        onChange={event => setMedicalProduct(event.target.value)}
                                        placeholder={t('translation:vaccine')}
                                        required
                                    >
                                        {medicalProductOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* combobox marketingHolder */}
                            <Form.Group as={Row} controlId='formMarketingHolderInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-marketing-holder') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={marketingHolder}
                                        onChange={event => setMarketingHolder(event.target.value)}
                                        placeholder={t('translation:def-vac-marketing-holder')}
                                        required
                                    >
                                        {marketingHolderOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* sequence */}
                            <Form.Group as={Row} controlId='formTotInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:sequence') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={sequence}
                                        onChange={event => setSequence(parseInt(event.target.value))}
                                        placeholder={t('translation:def-sequence')}
                                        type='number'
                                        required
                                        min={0}
                                        max={999999999}
                                        maxLength={6}
                                    />
                                </Col>
                            </Form.Group>

                            {/* tot */}
                            <Form.Group as={Row} controlId='formTotInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:tot') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={tot}
                                        onChange={event => setTot(parseInt(event.target.value))}
                                        placeholder={t('translation:def-tot')}
                                        type='number'
                                        required
                                        min={1}
                                        max={9}
                                    />
                                </Col>
                            </Form.Group>

                            {/* vacLastDate */}
                            <Form.Group as={Row} controlId='formLastDateInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:vac-last-date') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={vacLastDate}
                                        onChange={handleVacLastDate}
                                        locale='de'
                                        dateFormat='dd. MM. yyyy'
                                        isClearable
                                        placeholderText={t('translation:vac-last-date')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={new Date()}
                                        minDate={new Date(2020, 10)}
                                        openToDate={new Date()}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            {/* Combobox for the vaccin countries in iso-3166-1-alpha-2 */}
                            <Form.Group as={Row} controlId='formVacCountryInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-country') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={issuerCountry}
                                        onChange={event => setIssuerCountry(event.target.value)}
                                        placeholder={t('translation:country')}
                                        required
                                    >
                                        {isoCountryOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <hr />
                            {/* lot */}
                            <Form.Group as={Row} controlId='formLotInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:lot')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={lot}
                                        onChange={event => setLot(event.target.value)}
                                        placeholder={t('translation:def-lot')}
                                        type='text'
                                        maxLength={79}
                                    />
                                </Col>
                            </Form.Group>

                            {/* adm */}
                            <Form.Group as={Row} controlId='formAdmInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:adm')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={adm}
                                        onChange={event => setAdm(event.target.value)}
                                        placeholder={t('translation:def-adm')}
                                        type='text'
                                        maxLength={79}
                                    />
                                </Col>
                            </Form.Group>
                            <hr />
                        </Card.Body>

                        {/*
                            footer with clear and nex button
                        */}
                        <Card.Footer id='data-footer'>
                            <Row>
                                <Col xs='6' md='3'>
                                    <Button
                                        className='my-1 my-md-0 p-0'
                                        block
                                        onClick={handleCancel}
                                    >
                                        {t('translation:cancel')}
                                    </Button>
                                </Col>
                                <Col xs='6' md='3' className='pr-md-0'>
                                    <Button
                                        className='my-1 my-md-0 p-0'
                                        block
                                        type='submit'
                                    >
                                        {t('translation:next')}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Footer>

                    </Form>
                </Card>
            </>
    )
}

export default RecordVaccinationCertData;