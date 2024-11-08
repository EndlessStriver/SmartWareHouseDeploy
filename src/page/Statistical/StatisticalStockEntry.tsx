import React from "react";
import formatDateForInputNoTime from "../../util/FormartDateInputNoTime";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import Pagination from "../../compoments/Pagination/Pagination";
import formatDateVietNam from "../../util/FormartDateVietnam";
import { Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import { useDispatchMessage } from "../../Context/ContextMessage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PaginationType from "../../interface/Pagination";
import StatisticalStockEntryAPI, { CheckedProduct } from "../../services/Statistical/StatisticalStockEntryAPI";
import * as XLSX from 'xlsx';

interface CheckedProductToDataExcel {
    productCode: string;
    productName: string;
    receiveQuantity: number;
    unit: string;
}

const StaticticalStockEntry = () => {
    const dispatch = useDispatchMessage();
    const [fromDate, setFromDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
    const [toDate, setToDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
    const [productStockEntry, setProductStockEntry] = React.useState<CheckedProduct[]>([]);
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalElementOfPage: 0,
        totalPage: 0,
    })
    const [loading, setLoading] = React.useState<boolean>(false);
    const [reload, setReload] = React.useState<boolean>(false);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
        setLoading(true);
        StatisticalStockEntryAPI(fromDate, toDate, pagination.offset, pagination.limit)
            .then((res) => {
                if (res) {
                    if (res.checkedProducts.length === 0) dispatch({ type: ActionTypeEnum.ERROR, message: "Không Có Hàng Được Nhập Trong Khoảng Thời Gian Này" })
                    setProductStockEntry(res.checkedProducts);
                    setPagination({
                        limit: res.limit,
                        offset: res.currentPage,
                        totalPage: res.totalPages,
                        totalElementOfPage: 0,
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message })
            })
            .finally(() => {
                setLoading(false);
            })
    }, [reload]);

    const handleExportPDF = () => {
        const input = contentRef.current;
        if (input) {
            html2canvas(input, { scale: 2 })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, 'PNG', 0, 5, pdfWidth, pdfHeight);
                    pdf.save('document.pdf');
                })
        }
    }

    const convertDataToExcel = (data: CheckedProduct[]): CheckedProductToDataExcel[] => {
        return data.map((item) => {
            return {
                productCode: item.product.productCode,
                productName: item.product.name,
                receiveQuantity: item.receiveQuantity,
                unit: item.unit ? item.unit.name : "Không có"
            }
        })
    }

    const exportToExcel = () => {
        const data = convertDataToExcel(productStockEntry);
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        const headers = [["Mã Sản Phẩm", "Tên Sản Phẩm", "Số Lượng", "Đơn Vị"]];
        XLSX.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'data.xlsx');
    };

    return (
        <div>
            <div className={"mb-4"}>
                <div>
                    <h1 className="h2 fw-bold">THỐNG KÊ NHẬP KHO</h1>
                    <p className="h6">Bạn có thể thống kê số liệu nhập kho ở đây</p>
                </div>
                <div className="d-flex flex-row text-nowrap justify-content-center align-items-center gap-3">
                    <span>Từ ngày:</span>
                    <input type="date" value={formatDateForInputNoTime(fromDate)} onChange={(e) => setFromDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
                    <span>Đến ngày:</span>
                    <input type="date" value={formatDateForInputNoTime(toDate)} onChange={(e) => setToDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
                    <span>Trạng thái:</span>
                    <button
                        onClick={() => {
                            const currentDate = new Date();
                            const fromDateConvert = new Date(fromDate);
                            const toDateConvert = new Date(toDate);
                            if (fromDateConvert > currentDate) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày bắt đầu không được lớn hơn ngày hiện tại" })
                                return;
                            }
                            if (toDateConvert > currentDate) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày kết thúc không được lớn hơn ngày hiện tại" })
                                return;
                            }
                            if (fromDateConvert > toDateConvert) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" })
                                return;
                            }
                            setReload(!reload)
                        }}
                        className="btn btn-primary"
                    >
                        Thống kê
                    </button>
                    <button
                        disabled={productStockEntry.length === 0}
                        className="btn btn-danger"
                        onClick={handleExportPDF}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                        Xuất PDF
                    </button>
                    <button
                        disabled={productStockEntry.length === 0}
                        className="btn btn-success"
                        onClick={exportToExcel}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                        Xuất Excel
                    </button>
                </div>
                <div ref={contentRef} className="mt-5">
                    <h3 className="text-center fw-bold">BẢNG THỐNG KÊ HÀNG HÓA NHẬP KHO</h3>
                    <div>
                        <p className="text-center">Từ ngày: {formatDateVietNam(fromDate)} - Đến ngày: {formatDateVietNam(toDate)}</p>
                    </div>
                    <Table striped bordered responsive className="mt-4">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã Sản Phẩm</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Số Lượng Nhập</th>
                                <th>Đơn vị</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                productStockEntry.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product.productCode}</td>
                                        <td>{item.product.name}</td>
                                        <td>{item.receiveQuantity}</td>
                                        <td>{item.unit ? item.unit.name : "Không có"}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
                {
                    productStockEntry.length > 0 &&
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination.totalPage}
                        onPageChange={(page) => {
                            setPagination({ ...pagination, offset: page });
                        }}
                    />
                }
                {
                    productStockEntry.length === 0 &&
                    <NoData />
                }
                {
                    loading &&
                    <SpinnerLoading />
                }
            </div>
        </div>
    );
}

export default StaticticalStockEntry;