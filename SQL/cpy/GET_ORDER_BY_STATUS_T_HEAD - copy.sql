select q'<
				 {
						 cells: [
								 {
										 type: 'header',
										 value: 'Execution Date',
										 filter: true
								 },
								 {
										 type: 'header',
										 value: 'Suspended'
								 },
								 {
										 type: 'header',
										 value: 'Cancelled'
								 },
								 {
										 type: 'header',
										 value: 'Completed'
								 },
								 {
										 type: 'header',
										 value: 'Superseded'
								 },
								 {
										 type: 'header',
										 value: 'Processing'
								 },
								 {
										 type: 'header',
										 value: 'Archived'
								 },
								 {
										 type: 'header',
										 value: 'Entering'
								 },
								 {
										 type: 'header',
										 value: 'Suspending'
								 },
								 {
										 type: 'header',
										 value: 'Total'
								 }
							]
				 }>' as data
from dual