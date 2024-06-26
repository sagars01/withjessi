
"use client"

import { Button, Row, Col } from 'antd';
import { HomeOutlined, DollarOutlined, PhoneOutlined, LoginOutlined } from '@ant-design/icons';
import styles from '../../../libs/styles/components/PublicHeader.module.css'; // Import your CSS module for styling


interface IHeaderProps {
    hideOption?: boolean;
}
const PublicHeader: React.FC<IHeaderProps> = ({ hideOption = true }) => {
    const navigateTo = (path: string) => {
        window.location.href = path
    };

    return (
        <div className={styles.header}>
            <Row justify="space-between" align="middle" className={styles.row}>
                <Col >
                    {
                        !hideOption && (
                            <ul className={styles.navList}>
                                <li className={styles.navItem} onClick={() => navigateTo('/')}>
                                    <HomeOutlined /> Home
                                </li>
                                <li className={styles.navItem} onClick={() => navigateTo('/pricing')}>
                                    <DollarOutlined /> Pricing
                                </li>
                                <li className={styles.navItem} onClick={() => navigateTo('/contact')}>
                                    <PhoneOutlined /> Contact Us
                                </li>
                                <li className={styles.navItem}>
                                    <Button
                                        icon={<LoginOutlined />}
                                        onClick={() => navigateTo('/login')}
                                        className={styles.loginButton}
                                    >
                                        Login
                                    </Button>
                                </li>
                            </ul>
                        )
                    }

                </Col>
            </Row>
        </div>
    );
};

export default PublicHeader;
