<?php
Yii::import('application.vendors.*');
// Load up all the html dom-parser
require_once 'html-dom-parser/simple_html_dom.php';

class VDAB
{
	private static $url = 'http://www.vdab.be/mijnvdab/jobs/wz/jobs.jsp?action=SEARCH&trefwoorden=';
	private static $max_per_skill = 15;
	
	public static function search_vacancies($skills, $companies)
	{
		$results = array();

		// everything to lower case
		$skills = array_map('strtolower', $skills);
		$companies = array_map('strtolower', $companies);

		// search the vacancy database for each skill
		foreach ($skills as $skill)
		{
			// fetch html from search page
			$html = file_get_html(self::$url.$skill);

			// get the table with the search results
			$search_results = $html->find('table[id=searchResult]', 0);

			// if nothing is found, try the next skill
			if (is_null($search_results))
				continue;

			// first child is the table header
			$job = $search_results->first_child();

			$cnt = 0;
			
			// iterate over vacancies
			while (!is_null($job = $job->next_sibling()))
			{
				$row = $job->find('td[headers=t2]', 0);
				$info = $row->find('a', 0);

				// the job description
				$title = $info->innertext;

				// extra page with more detailed info about the vacancy
				$extra = self::sanitize_url($info->href);

				// company and location
				list($company, $location) = self::extract_comploc($row);

				// construct object, calculate features and append it to the result
				$vac = new Vacancy($title, $skill, $extra, $company, $location);
				$vac->calculate_feature_vector(array_unique($skills), $companies);
				array_push($results, $vac);
				
				$cnt++;
				if ($cnt >= self::$max_per_skill)
					break; // screw you guys, i have enough vacancies
			}
		}

        //$vac_speciaal_voor_matt = new Vacancy(
            //'Junior SharePoint Specialist (M/V) (MERELBEKE)',
            //'sharepoint'
            //'http://www.vdab.be/mijnvdab/jobs/wz/jobs.jsp?ID=8476274&action=DETAIL',
            //'Orbid',
            //'Merelbeke');
        //$vac_speciaal_voor_matt->calculate_feature_vector($skills, $companies);
        //array_push($results, $vac_speciaal_voor_matt);

		// sort them on some criteria defined in the vacancy class
		usort($results, array('Vacancy', 'cmp'));
		
		// return them in reverse order (most relevant first)
		return array_reverse($results);
	}

	private static function sanitize_url($url)
	{
		// complete url and remove session information
		$url = html_entity_decode('http://www.vdab.be'.$url);
		$url = preg_replace('/&?sess=[^&]*/', '', $url, 1);
		$url = preg_replace('/&?csess=[^&]*/', '', $url, 1);

		return $url;
	}

	private static function extract_comploc($row)
	{
		// separate the company and location
		$needle = '</a></b><br />';
		$comploc_start = strpos($row, $needle) + strlen($needle);
		$comploc_end = strpos($row, '</td>');
		$comploc = substr($row, $comploc_start, $comploc_end - $comploc_start);

		// split and trim the data
		$comploc = explode('<br />', $comploc);

		// remove useless starting words
		foreach ($comploc as &$val)
		{
			// capitalize each word
			$val = ucwords(strtolower(trim($val)));

			list($first, $second) = explode(' ', $val, 2);
			if (in_array($first, array('Bij', 'In', 'Via')))
				$val = $second;
		}

		return $comploc;
	}
}
?>
