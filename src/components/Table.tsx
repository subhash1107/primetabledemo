import { DataTable, DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { Button } from 'primereact/button';
import axios, { AxiosError } from 'axios';
import { InputText } from 'primereact/inputtext';

interface ArtifactsResponse {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

interface ApiResponse {
    data:ArtifactsResponse[];
    pagination:{
        total:number;
    }
}

const Table: React.FC = () => {
    
    const [data, setData] = useState<ArtifactsResponse[]>([]); 
    const [selectedData, setSelectedData] = useState<ArtifactsResponse[]>([]);
    const [totaLRecords, setTotalRecords] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [rows, setRows] = useState<number>(4);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const op = useRef<OverlayPanel | null>(null)
    const[overlayInputVal,setOverlayInputVal] = useState<number|undefined>();

    const fetchData = async (current_page: number) => {
        setLoading(true);
        try {
            const res = await axios.get<ApiResponse>(BASE_URL + `?page=${current_page}&&limit=${rows}`);
          
            setData(res.data.data);
            setTotalRecords(res.data.pagination.total);
        } catch (err) {
            console.error("Error fetching data:", (err as AxiosError).message)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage,rows]);

    const onPageChange = (event: DataTablePageEvent) => {
        if(event.page){
        setCurrentPage(event.page + 1);
        }else{
            setCurrentPage(1)
        } 
        setRows(event.rows)
    };
    
    const handleSelectRows = async () => {
            if (!overlayInputVal || overlayInputVal <= 0) return;
            if (overlayInputVal<=rows){
                setSelectedData(data.slice(0,rows))
            }
            if(overlayInputVal>rows){
            try {
                setSelectedData(data.slice(0,rows))
                const res = await axios.get<ApiResponse>(BASE_URL + `?page=1&limit=${overlayInputVal}`);
                const fetchedData: ArtifactsResponse[] = res.data.data;
                const selectedIds = new Set(selectedData.map((row) => row.id));
                const uniqueSelectedData = fetchedData.filter((item) => !selectedIds.has(item.id));
                const finalSelectedData = [
                    ...selectedData,
                    ...uniqueSelectedData
                ];
                setSelectedData(finalSelectedData.slice(0, overlayInputVal));
            } 
            catch (err) {
                console.error("Error fetching data:", (err as AxiosError).message)
            } 
        }
    };
     
    return (<>
    <h1 className='text-center my-5 text-gray-600'>Table-artifacts</h1>
        <div className="card prime-wrapper">
                <DataTable
                value={data}
                paginator
                lazy
                rows={rows} 
                first={(currentPage - 1) * rows}
                totalRecords={totaLRecords}
                loading={loading}
                onPage={onPageChange}
                selectionMode={'multiple'}
                selection={selectedData}
                onSelectionChange={(e:DataTableSelectionMultipleChangeEvent<ArtifactsResponse[]>) => setSelectedData(e.value ?? [])}
                dataKey="id"
                rowsPerPageOptions={[4,8,12,16,20]} 
            >
                <Column 
                    selectionMode="multiple" 
                    headerStyle={{ width: '3rem' }}
                />
                <Column
                    field="title"
                    header={
                        <div className="flex items-center">
                            <button  className="mr-2 border-none bg-transparent hover:cursor-pointer hover:rounded-full p-1 hover:bg-gray-200" onClick={(e) => op.current?.toggle(e)}
                                type="button">
                                <i className="pi pi-chevron-down" style={{ fontSize: '1rem', color: '#666' }} />
                            </button>
                            Title
                        </div>
                    }
                    style={{ width: '25%' }}
                    className=""
                    
                />
                <Column
                    field="place_of_origin"
                    header="Origin"
                    style={{ width: '10%' }}
                    className=""
                    
                />
                <Column
                    field="artist_display"
                    header="Artist"
                    style={{ width: '25%' }}
                    className=""
                    
                />
                <Column
                    field="inscriptions"
                    header="Inscriptions"
                    style={{ width: '25%' }}
                    className=""
                    
                />
                <Column
                    field="date_start"
                    header="Start"
                    style={{ width: '7%' }}
                    className=""
                    
                />
                <Column
                    field="date_end"
                    header="End"
                    style={{ width: '7%' }}
                    className=""
                    
                />
            </DataTable>
            <OverlayPanel ref={op}>
                <div className='flex flex-col gap-2'>
                <InputText 
                placeholder='enter rows number...' 
                type='number' 
                value={overlayInputVal?.toString()}
                onChange={(e)=>setOverlayInputVal(Number(e.target.value))}
                />
                <Button label='Submit' 
                onClick={(e)=>{
                    op.current?.toggle(e);
                    handleSelectRows();
                    setOverlayInputVal(Number(''))
                }}/>
                </div>             
            </OverlayPanel>

        </div>
        </>);
};

export default Table;