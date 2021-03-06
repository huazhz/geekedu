<?php

namespace Site\LessonBundle\Repository;

use Doctrine\ODM\MongoDB\DocumentRepository;

/**
 * TypeRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class TypeRepository extends DocumentRepository
{
	public function findChildrenAll()
	{
		$typeall = $this->findAllByOrder();
        $types = array();
        foreach ($typeall as $key => $value) {
        	if(substr_count($value->getPath(),'-') == 1){
        		$types[] = $value;
        	}
        }
        return $types;
	}
    public function findAllByOrder()
    {
        return $typeall = $this->createQueryBuilder()
            ->sort('order', 'ASC')
            ->getQuery()
            ->execute();
    }
}